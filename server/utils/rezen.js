const archiver = require('archiver');

const API_BASES = {
  arrakis: 'https://arrakis.therealbrokerage.com',
  sherlock: 'https://sherlock.therealbrokerage.com',
  dropbox: 'https://dropbox.therealbrokerage.com',
};

const LIFECYCLE_GROUPS = ['OPEN', 'CLOSED', 'TERMINATED'];

function getApiKey() {
  const key = process.env.REZEN_API_KEY;
  if (!key) {
    throw new Error('REZEN_API_KEY environment variable is not configured');
  }
  return key;
}

function sanitizeName(value) {
  if (!value) return 'Unknown';
  return value.replace(/[/\\:*?"<>|]/g, '_').trim() || 'Unknown';
}

function formatAddress(addressObj) {
  if (!addressObj) return '';
  if (typeof addressObj === 'string') return addressObj;
  if (addressObj.oneLine) return addressObj.oneLine;
  if (addressObj.address) return addressObj.address;
  return [addressObj.street, addressObj.city, addressObj.state, addressObj.zip]
    .filter(Boolean)
    .join(', ');
}

async function rezenFetch(base, path) {
  const fetch = (await import('node-fetch')).default;
  const url = `${API_BASES[base]}${path}`;
  const response = await fetch(url, {
    headers: { 'X-API-Key': getApiKey() },
    timeout: 30000,
  });
  if (!response.ok) {
    throw new Error(`reZEN API error: ${response.status} ${response.statusText} (${base}${path})`);
  }
  return response;
}

async function getTransactionDetails(transactionId) {
  const response = await rezenFetch('arrakis', `/api/v1/transactions/${transactionId}`);
  const data = await response.json();
  return {
    id: data.id,
    address: formatAddress(data.address) || 'Unknown Address',
    checklistId: data.checklistId || null,
    dropboxId: data.dropboxId || null,
  };
}

async function getChecklistItems(checklistId) {
  if (!checklistId) return [];
  const response = await rezenFetch('sherlock', `/api/v1/checklists/${checklistId}`);
  const data = await response.json();
  return data.items || [];
}

function extractChecklistDocuments(items) {
  const docs = [];
  for (const item of items) {
    const itemName = item.name || 'Unknown';
    for (const doc of (item.documents || [])) {
      const currentVersion = doc.currentVersion || {};
      const versionId = currentVersion.id;
      if (versionId) {
        docs.push({
          versionId,
          name: doc.name || currentVersion.name || `${versionId}.bin`,
          checklistItem: itemName,
        });
      }
    }
  }
  return docs;
}

function extractDropboxIds(items) {
  const ids = [];
  for (const item of items) {
    const refs = item.fileReferences || [];
    for (const ref of refs) {
      if (ref.dropboxId) ids.push(ref.dropboxId);
    }
  }
  return [...new Set(ids)];
}

async function getChecklistDocDownloadUrl(versionId) {
  const response = await rezenFetch(
    'sherlock',
    `/api/v1/checklists/checklist-documents/versions/${versionId}/download`
  );
  const text = await response.text();
  return text.replace(/^"|"$/g, '');
}

async function getDropboxFiles(dropboxId) {
  if (!dropboxId) return [];
  try {
    const response = await rezenFetch('dropbox', `/api/v1/dropboxes/${dropboxId}`);
    const data = await response.json();
    return data.files || [];
  } catch {
    return [];
  }
}

async function getFileDownloadUrl(fileId) {
  const response = await rezenFetch(
    'dropbox',
    `/api/v1/files/${fileId}/url?downloadAsAttachment=true`
  );
  const text = await response.text();
  return text.replace(/^"|"$/g, '');
}

async function downloadFileContent(url) {
  const fetch = (await import('node-fetch')).default;
  const response = await fetch(url, { timeout: 60000 });
  if (!response.ok) {
    throw new Error(`File download failed: ${response.status}`);
  }
  return response.buffer();
}

async function getAgentTransactions(yentaId, lifecycle) {
  const results = [];
  let page = 0;
  const pageSize = 100;

  while (true) {
    const response = await rezenFetch(
      'arrakis',
      `/api/v1/transactions/participant/${yentaId}/transactions/${lifecycle}?pageNumber=${page}&pageSize=${pageSize}&sortBy=UPDATED_AT&sortDirection=DESC`
    );
    const data = await response.json();
    const rows = data.transactions || [];
    results.push(...rows);
    if (!data.hasNext || rows.length === 0) break;
    page++;
  }

  return results;
}

function ensureUniqueFilename(usedNames, filename) {
  if (!usedNames.has(filename)) {
    usedNames.add(filename);
    return filename;
  }
  const dotIdx = filename.lastIndexOf('.');
  const stem = dotIdx > 0 ? filename.substring(0, dotIdx) : filename;
  const ext = dotIdx > 0 ? filename.substring(dotIdx) : '';
  let counter = 1;
  while (true) {
    const candidate = `${stem} (${counter})${ext}`;
    if (!usedNames.has(candidate)) {
      usedNames.add(candidate);
      return candidate;
    }
    counter++;
  }
}

async function collectTransactionFiles(transactionId, onProgress) {
  const details = await getTransactionDetails(transactionId);
  const folderName = sanitizeName(details.address) || transactionId;

  if (onProgress) onProgress(`Fetching checklist for ${folderName}...`);

  const checklistItems = await getChecklistItems(details.checklistId);
  const files = [];
  const usedNames = new Set();

  const checklistDocs = extractChecklistDocuments(checklistItems);
  for (const doc of checklistDocs) {
    try {
      const downloadUrl = await getChecklistDocDownloadUrl(doc.versionId);
      const content = await downloadFileContent(downloadUrl);
      const safeName = ensureUniqueFilename(usedNames, sanitizeName(doc.name));
      files.push({ name: safeName, content });
    } catch (err) {
      console.error(`Error downloading checklist doc ${doc.versionId}: ${err.message}`);
    }
  }

  const dropboxIds = extractDropboxIds(checklistItems);
  if (details.dropboxId && !dropboxIds.includes(details.dropboxId)) {
    dropboxIds.push(details.dropboxId);
  }

  for (const dbId of dropboxIds) {
    const dropboxFiles = await getDropboxFiles(dbId);
    for (const file of dropboxFiles) {
      try {
        const downloadUrl = await getFileDownloadUrl(file.id);
        const content = await downloadFileContent(downloadUrl);
        const rawName = file.filename || file.name || `${file.id}.bin`;
        const safeName = ensureUniqueFilename(usedNames, sanitizeName(rawName));
        files.push({ name: safeName, content });
      } catch (err) {
        console.error(`Error downloading dropbox file ${file.id}: ${err.message}`);
      }
    }
  }

  return { transactionId, address: details.address, folderName, files };
}

function createDownloadTransactionHandler() {
  return async function handleDownloadTransaction(req, res) {
    try {
      const { transactionIds } = req.body;

      if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
        return res.status(400).json({ error: 'transactionIds array is required' });
      }

      if (transactionIds.length > 20) {
        return res.status(400).json({ error: 'Maximum 20 transactions per request' });
      }

      const archive = archiver('zip', { zlib: { level: 5 } });
      const buffers = [];
      archive.on('data', (chunk) => buffers.push(chunk));

      const results = [];
      for (const txId of transactionIds) {
        try {
          const txFiles = await collectTransactionFiles(txId);
          const prefix = transactionIds.length > 1 ? `${txFiles.folderName}/` : '';
          for (const file of txFiles.files) {
            archive.append(file.content, { name: `${prefix}${file.name}` });
          }
          results.push({
            transactionId: txId,
            address: txFiles.address,
            fileCount: txFiles.files.length,
          });
        } catch (err) {
          results.push({ transactionId: txId, error: err.message });
        }
      }

      await archive.finalize();
      await new Promise((resolve) => archive.on('end', resolve));

      const zipBuffer = Buffer.concat(buffers);
      const totalFiles = results.reduce((sum, r) => sum + (r.fileCount || 0), 0);

      if (totalFiles === 0) {
        return res.status(404).json({
          error: 'No files found for the provided transaction(s)',
          details: results,
        });
      }

      const zipName = transactionIds.length === 1
        ? `${sanitizeName(results[0].address || transactionIds[0])}.zip`
        : `transactions-${transactionIds.length}.zip`;

      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipName}"`,
        'Content-Length': zipBuffer.length,
        'X-File-Count': totalFiles,
        'X-Transaction-Results': JSON.stringify(results),
      });

      res.send(zipBuffer);
    } catch (error) {
      console.error('reZEN download-transaction error:', error);
      res.status(500).json({ error: error.message });
    }
  };
}

function createDownloadAgentHandler() {
  return async function handleDownloadAgent(req, res) {
    try {
      const { yentaId, lifecycleFilter } = req.body;

      if (!yentaId || typeof yentaId !== 'string') {
        return res.status(400).json({ error: 'yentaId string is required' });
      }

      const lifecycles = lifecycleFilter && LIFECYCLE_GROUPS.includes(lifecycleFilter)
        ? [lifecycleFilter]
        : LIFECYCLE_GROUPS;

      const allTransactionIds = [];
      for (const lifecycle of lifecycles) {
        try {
          const transactions = await getAgentTransactions(yentaId, lifecycle);
          for (const tx of transactions) {
            const txId = tx.id || tx.transactionId;
            if (txId) allTransactionIds.push(txId);
          }
        } catch (err) {
          console.error(`Error fetching ${lifecycle} transactions: ${err.message}`);
        }
      }

      if (allTransactionIds.length === 0) {
        return res.status(404).json({ error: 'No transactions found for this agent' });
      }

      if (allTransactionIds.length > 100) {
        return res.status(400).json({
          error: `Agent has ${allTransactionIds.length} transactions. Maximum supported is 100. Use a lifecycle filter to narrow results.`,
        });
      }

      const archive = archiver('zip', { zlib: { level: 5 } });
      const buffers = [];
      archive.on('data', (chunk) => buffers.push(chunk));

      const results = [];
      const usedFolderNames = new Set();

      for (const txId of allTransactionIds) {
        try {
          const txFiles = await collectTransactionFiles(txId);
          let folderName = txFiles.folderName;
          if (usedFolderNames.has(folderName)) {
            folderName = `${folderName} (${txId.substring(0, 8)})`;
          }
          usedFolderNames.add(folderName);

          for (const file of txFiles.files) {
            archive.append(file.content, { name: `${folderName}/${file.name}` });
          }
          results.push({
            transactionId: txId,
            address: txFiles.address,
            fileCount: txFiles.files.length,
          });
        } catch (err) {
          results.push({ transactionId: txId, error: err.message });
        }
      }

      await archive.finalize();
      await new Promise((resolve) => archive.on('end', resolve));

      const zipBuffer = Buffer.concat(buffers);
      const totalFiles = results.reduce((sum, r) => sum + (r.fileCount || 0), 0);

      if (totalFiles === 0) {
        return res.status(404).json({
          error: 'No downloadable files found across agent transactions',
          details: results,
        });
      }

      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="agent-${yentaId.substring(0, 8)}-files.zip"`,
        'Content-Length': zipBuffer.length,
        'X-File-Count': totalFiles,
        'X-Transaction-Count': allTransactionIds.length,
        'X-Transaction-Results': JSON.stringify(results),
      });

      res.send(zipBuffer);
    } catch (error) {
      console.error('reZEN download-agent error:', error);
      res.status(500).json({ error: error.message });
    }
  };
}

module.exports = {
  createDownloadTransactionHandler,
  createDownloadAgentHandler,
};

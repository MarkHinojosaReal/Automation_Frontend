function createMetabaseInspectHandler() {
  return async function inspectMetabaseCard(req, res) {
    try {
      const { cardId } = req.body;

      if (!cardId) {
        return res.status(400).json({ error: 'Card ID is required' });
      }

      const metabaseBaseUrl = 'https://metabase.therealbrokerage.com';
      const metabaseApiKey = process.env.METABASE_API_KEY;

      const fetch = (await import('node-fetch')).default;
      const url = `${metabaseBaseUrl}/api/card/${cardId}?ignore_view=true`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': metabaseApiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Metabase API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const result = {
        card_id: cardId,
        card_title: data.name || 'Unknown',
        sql_query: '',
        columns: []
      };

      if (data.dataset_query && data.dataset_query.native) {
        const nativeQuery = data.dataset_query.native;
        if (nativeQuery.query) {
          result.sql_query = nativeQuery.query;
        } else {
          result.sql_query = "No 'query' field found in native dataset_query";
        }
      } else {
        result.sql_query = 'No native SQL query found in dataset_query';
      }

      if (data.result_metadata) {
        const columns = data.result_metadata;
        result.columns = columns.map((column, index) => ({
          index: index + 1,
          name: column.name || `column_${index}`,
          type: column.base_type || 'Unknown'
        }));
      }

      res.json(result);
    } catch (error) {
      console.error('Metabase inspection error:', error);
      res.status(500).json({ error: error.message });
    }
  };
}

module.exports = {
  createMetabaseInspectHandler
};

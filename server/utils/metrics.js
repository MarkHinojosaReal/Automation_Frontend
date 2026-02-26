const { Client } = require('pg');

function buildClientConfig(useDevelopmentConfig) {
  const baseConfig = {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DATABASE,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
  };

  if (useDevelopmentConfig) {
    return {
      ...baseConfig,
      ssl: true,
      connectionTimeoutMillis: 30000,
      query_timeout: 60000
    };
  }

  return {
    ...baseConfig,
    ssl: {
      rejectUnauthorized: false
    }
  };
}

function isTimeoutError(error) {
  const message = error?.message || '';
  return message.includes('timeout') || message.includes('ETIMEDOUT');
}

function normalizeExecutionStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();

  if (['passed', 'pass', 'success', 'succeeded', 'completed', 'done'].includes(normalized)) {
    return 'Passed';
  }

  if (['failed', 'failure', 'error', 'errored', 'cancelled', 'canceled', 'aborted', 'timeout', 'timed_out'].includes(normalized)) {
    return 'Failed';
  }

  if (['running', 'in progress', 'in_progress', 'processing', 'executing'].includes(normalized)) {
    return 'Running';
  }

  if (['queued', 'pending', 'waiting', 'scheduled'].includes(normalized)) {
    return 'Pending';
  }

  if (['skipped', 'skip'].includes(normalized)) {
    return 'Skipped';
  }

  return 'Other';
}

function getExecutionStatusColor(status) {
  if (status === 'Passed') {
    return '#10b981';
  }
  if (status === 'Failed') {
    return '#ef4444';
  }
  if (status === 'Running') {
    return '#3b82f6';
  }
  if (status === 'Pending') {
    return '#f59e0b';
  }
  if (status === 'Skipped') {
    return '#8b5cf6';
  }
  return '#64748b';
}

async function fetchMetricsData(client) {
  const executionsQuery = `
    SELECT
      id,
      automation_id,
      automation_start_time,
      automation_end_time,
      status,
      EXTRACT(EPOCH FROM (automation_end_time - automation_start_time)) as duration_seconds
    FROM src.automation_executions
    ORDER BY automation_start_time DESC
  `;

  const executionsResult = await client.query(executionsQuery);
  const executions = executionsResult.rows;
  const normalizedExecutions = executions.map((execution) => ({
    ...execution,
    normalizedStatus: normalizeExecutionStatus(execution.status)
  }));

  const totalExecutions = executions.length;
  const successfulExecutions = normalizedExecutions.filter((execution) => execution.normalizedStatus === 'Passed').length;
  const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

  const durations = executions.map((execution) => parseFloat(execution.duration_seconds));
  const averageDuration = durations.length > 0
    ? durations.reduce((first, second) => first + second, 0) / durations.length
    : 0;

  const statusCounts = normalizedExecutions.reduce((accumulator, execution) => {
    accumulator[execution.normalizedStatus] = (accumulator[execution.normalizedStatus] || 0) + 1;
    return accumulator;
  }, {});

  const executionsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
    color: getExecutionStatusColor(status)
  }));

  const today = new Date();
  const executionsByDay = [];

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - index);
    const dateStr = date.toISOString().split('T')[0];

    const dayExecutions = executions.filter((execution) => {
      const executionDate = new Date(execution.automation_start_time).toISOString().split('T')[0];
      return executionDate === dateStr;
    }).length;

    executionsByDay.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      executions: dayExecutions
    });
  }

  const automationCounts = executions.reduce((accumulator, execution) => {
    if (!accumulator[execution.automation_id]) {
      accumulator[execution.automation_id] = { count: 0, totalDuration: 0 };
    }
    accumulator[execution.automation_id].count += 1;
    accumulator[execution.automation_id].totalDuration += parseFloat(execution.duration_seconds);
    return accumulator;
  }, {});

  const executionsByAutomation = Object.entries(automationCounts).map(([id, data]) => ({
    automation_id: id.slice(0, 8) + '...',
    count: data.count,
    avg_duration: data.totalDuration / data.count
  }));

  const recentExecutions = executions.slice(0, 10).reverse();
  const durationTrend = recentExecutions.map((execution) => ({
    time: new Date(execution.automation_start_time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    duration: parseFloat(execution.duration_seconds)
  }));

  return {
    totalExecutions,
    successRate,
    averageDuration,
    executionsByStatus,
    executionsByDay,
    executionsByAutomation,
    durationTrend,
    recentExecutions: executions.slice(0, 20)
  };
}

function createMetricsHandler(options = {}) {
  const { developmentTimeoutResponse = false } = options;

  return async function metricsHandler(_req, res) {
    const missingPasswordMessage = developmentTimeoutResponse
      ? 'POSTGRES_PASSWORD environment variable is required. Please check your .env file.'
      : 'POSTGRES_PASSWORD environment variable is required. Please check your environment variables.';

    if (!process.env.POSTGRES_PASSWORD) {
      console.error('❌ POSTGRES_PASSWORD environment variable is required');
      res.status(500).json({
        error: missingPasswordMessage,
        timestamp: new Date().toISOString()
      });
      return;
    }

    const client = new Client(buildClientConfig(developmentTimeoutResponse));

    try {
      await client.connect();
      const metricsData = await fetchMetricsData(client);
      res.json(metricsData);
    } catch (error) {
      console.error('💥 Error fetching metrics:', error);

      if (developmentTimeoutResponse && isTimeoutError(error)) {
        res.status(503).json({
          error: 'Database connection timeout - this is expected in local development environment',
          message: 'The metrics page will work properly when deployed to production on Render',
          timestamp: new Date().toISOString(),
          developmentNote: 'Local connections to Render Postgres may be restricted. This will work in production.'
        });
        return;
      }

      res.status(500).json({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      try {
        await client.end();
      } catch (closeError) {
        console.error('Error closing Postgres client:', closeError.message);
      }
    }
  };
}

module.exports = {
  createMetricsHandler
};

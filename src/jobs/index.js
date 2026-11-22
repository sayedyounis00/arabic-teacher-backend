'use strict';

const logger = require('../utils/logger');

/**
 * Background / Cron jobs orchestrator (optional)
 */
const initJobs = () => {
  logger.info('Jobs system initialized (no active cron jobs scheduled)');
};

module.exports = {
  initJobs,
};

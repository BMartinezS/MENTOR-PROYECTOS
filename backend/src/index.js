import 'dotenv/config';

import app from './app.js';
import { initDatabase } from './config/database.js';
import { startCheckinScheduler } from './jobs/checkin-scheduler.js';
import { startWeeklyReviewScheduler } from './jobs/weekly-review-scheduler.js';
import notificationService from './services/notification-service.js';

const PORT = process.env.PORT || 3000;

await initDatabase();

if (process.env.ENABLE_CHECKIN_SCHEDULER === 'true') {
  startCheckinScheduler();
}

if (process.env.ENABLE_WEEKLY_REVIEW_SCHEDULER === 'true') {
  startWeeklyReviewScheduler();
}

// Notification service is automatically initialized when imported
console.log('✅ Notification service initialized with scheduled reminders');

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on port ${PORT}`);
});

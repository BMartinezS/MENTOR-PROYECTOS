import cron from 'node-cron';

import { Project } from '../models/index.js';
import * as WeeklyReviewService from '../services/weekly-review-service.js';

export function startWeeklyReviewScheduler() {
  cron.schedule('0 18 * * 0', async () => {
    const projects = await Project.findAll({ where: { status: 'active' } });

    for (const project of projects) {
      try {
        await WeeklyReviewService.generate(project.userId, project.id, { project });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to generate weekly review', project.id, err.message);
      }
    }
  });
}

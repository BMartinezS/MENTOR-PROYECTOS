import cron from 'node-cron';
import { Op } from 'sequelize';

import { Checkin, Project } from '../models/index.js';
import * as CheckinService from '../services/checkin-service.js';

export function startCheckinScheduler() {
  cron.schedule('0 9 * * *', async () => {
    const activeProjects = await Project.findAll({ where: { status: 'active' } });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    for (const project of activeProjects) {
      const existing = await Checkin.findOne({
        where: {
          projectId: project.id,
          createdAt: { [Op.gte]: startOfToday },
        },
      });

      if (!existing) {
        await CheckinService.generateAndCreate(project.userId, project.id);
      }
    }
  });
}


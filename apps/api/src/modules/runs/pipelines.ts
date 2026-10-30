import { ObjectId } from 'mongodb';

export function createComparePipeline(
  projectId: ObjectId,
  baseRunId: ObjectId,
  headRunId: ObjectId,
) {
  return [
    {
      $match: {
        projectId,
        runId: { $in: [baseRunId, headRunId] },
      },
    },
    {
      $sort: { runId: -1, createdAt: -1 }, // Prefer head doc for unresolved
    },
    {
      $group: {
        _id: '$fingerprint',
        inBase: {
          $max: {
            $cond: [{ $eq: ['$runId', baseRunId] }, 1, 0],
          },
        },
        inHead: {
          $max: {
            $cond: [{ $eq: ['$runId', headRunId] }, 1, 0],
          },
        },
        doc: { $first: '$$ROOT' },
      },
    },
    {
      $addFields: {
        diffStatus: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [{ $eq: ['$inBase', 0] }, { $eq: ['$inHead', 1] }],
                },
                then: 'new',
              },
              {
                case: {
                  $and: [{ $eq: ['$inBase', 1] }, { $eq: ['$inHead', 0] }],
                },
                then: 'resolved',
              },
            ],
            default: 'unresolved',
          },
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ['$doc', { diffStatus: '$diffStatus' }],
        },
      },
    },
    {
      $sort: { severity: 1, endpoint: 1 },
    },
  ];
}

export function createHotspotsPipeline(projectId: ObjectId) {
  return [
    {
      $match: {
        projectId,
        severity: { $in: ['breaking', 'warning'] },
      },
    },
    {
      $group: {
        _id: { method: '$method', endpoint: '$endpoint' },
        occurrences: { $sum: 1 },
        runs: { $addToSet: '$runId' },
        lastSeen: { $max: '$createdAt' },
        changeTypes: { $addToSet: '$changeType' },
      },
    },
    {
      $addFields: {
        distinctRuns: { $size: '$runs' },
      },
    },
    {
      $match: {
        distinctRuns: { $gte: 2 },
      },
    },
    {
      $sort: { distinctRuns: -1, lastSeen: -1 },
    },
    {
      $limit: 10,
    },
    {
      $project: {
        _id: 0,
        method: '$_id.method',
        endpoint: '$_id.endpoint',
        occurrences: 1,
        distinctRuns: 1,
        lastSeen: 1,
        changeTypes: 1,
      },
    },
  ];
}

export function createAdminOverviewPipeline() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return [
    {
      $facet: {
        runsByStatus: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ],
        runsLast24h: [
          {
            $match: {
              createdAt: { $gte: oneDayAgo },
            },
          },
          {
            $count: 'count',
          },
        ],
      },
    },
  ];
}

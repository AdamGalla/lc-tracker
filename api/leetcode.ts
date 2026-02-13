import type { VercelRequest, VercelResponse } from '@vercel/node';

interface LeetCodeGraphQLRequest {
  query: string;
  variables?: Record<string, any>;
}

const LEETCODE_API = 'https://leetcode.com/graphql';

const USER_PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      username
      profile {
        realName
        userAvatar
        ranking
      }
      submitStats {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      submissionCalendar
    }
    recentSubmissionList(username: $username, limit: 100) {
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
  }
`;

const CALENDAR_QUERY = `
  query UserProfileCalendar($username: String!, $year: Int!) {
    matchedUser(username: $username) {
      userCalendar(year: $year) {
        activeYears
        streak
        totalActiveDays
        submissionCalendar
      }
    }
  }
`;

async function fetchLeetCodeGraphQL(
  query: string,
  variables: Record<string, any>
): Promise<any> {
  const response = await fetch(LEETCODE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://leetcode.com',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`LeetCode API error: ${response.status}`);
  }

  return response.json();
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const origin = request.headers.origin;

  const allowedOrigins = [
    'http://localhost:3000',
    'https://lc-tracker-amber.vercel.app',
  ];

  if (origin && allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  }

  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  try {
    const { username } = request.query;

    if (!username || typeof username !== 'string') {
      return response.status(400).json({ error: 'Username required' });
    }

    // Fetch all data in parallel
    const [profileData, calendarData] = await Promise.all([
      fetchLeetCodeGraphQL(USER_PROFILE_QUERY, { username }),
      fetchLeetCodeGraphQL(CALENDAR_QUERY, {
        username,
        year: new Date().getFullYear()
      }),
    ]);

    // Transform to match your existing interface
    const result = {
      username: profileData.data.matchedUser.username,
      profile: profileData.data.matchedUser.profile,
      solvedStats: {
        // Extract from acSubmissionNum
        all: profileData.data.matchedUser.submitStats.acSubmissionNum
          .find((s: any) => s.difficulty === 'All')?.count || 0,
        easy: profileData.data.matchedUser.submitStats.acSubmissionNum
          .find((s: any) => s.difficulty === 'Easy')?.count || 0,
        medium: profileData.data.matchedUser.submitStats.acSubmissionNum
          .find((s: any) => s.difficulty === 'Medium')?.count || 0,
        hard: profileData.data.matchedUser.submitStats.acSubmissionNum
          .find((s: any) => s.difficulty === 'Hard')?.count || 0,
      },
      totalQuestions: {
        all: profileData.data.allQuestionsCount
          .find((q: any) => q.difficulty === 'All')?.count || 0,
        easy: profileData.data.allQuestionsCount
          .find((q: any) => q.difficulty === 'Easy')?.count || 0,
        medium: profileData.data.allQuestionsCount
          .find((q: any) => q.difficulty === 'Medium')?.count || 0,
        hard: profileData.data.allQuestionsCount
          .find((q: any) => q.difficulty === 'Hard')?.count || 0,
      },
      streak: calendarData.data.matchedUser.userCalendar.streak,
      submissionCalendar: JSON.parse(
        calendarData.data.matchedUser.userCalendar.submissionCalendar
      ),
      recentSubmissions: profileData.data.recentSubmissionList.filter(
        (sub: any) => sub.statusDisplay === 'Accepted'
      ),
      lastFetched: Date.now(),
    };

    return response.status(200).json(result);
  } catch (error: any) {
    console.error('Error fetching LeetCode data:', error);
    return response.status(500).json({
      error: 'Failed to fetch LeetCode data',
      message: error.message
    });
  }
}

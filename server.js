const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');
const axios = require('axios');
const cheerio = require('cheerio');
const Sentiment = require('sentiment');
const moment = require('moment');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const sentiment = new Sentiment();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for demo purposes
let brandMentions = [];
let sentimentTrends = [];
let alertKeywords = [];

// Brand monitoring data collection
async function collectBrandMentions() {
  try {
    const mentions = [];
    
    // Simulate data collection from multiple sources
    // In a real implementation, you'd use actual APIs
    
    // Twitter-like mentions (simulated)
    const twitterMentions = [
      {
        platform: 'Twitter',
        content: 'Just discovered @LeapScholar - amazing platform for international students! #StudyAbroad',
        author: '@student_life',
        timestamp: moment().subtract(2, 'hours').toISOString(),
        engagement: 45,
        sentiment: sentiment.analyze('Just discovered @LeapScholar - amazing platform for international students! #StudyAbroad').score
      },
      {
        platform: 'Twitter',
        content: 'LeapScholar helped me get into my dream university! Highly recommend for anyone applying abroad.',
        author: '@future_student',
        timestamp: moment().subtract(4, 'hours').toISOString(),
        engagement: 23,
        sentiment: sentiment.analyze('LeapScholar helped me get into my dream university! Highly recommend for anyone applying abroad.').score
      },
      {
        platform: 'Twitter',
        content: 'Having issues with LeapScholar customer service. Anyone else experiencing delays?',
        author: '@concerned_user',
        timestamp: moment().subtract(6, 'hours').toISOString(),
        engagement: 12,
        sentiment: sentiment.analyze('Having issues with LeapScholar customer service. Anyone else experiencing delays?').score
      }
    ];

    // Reddit-like mentions (simulated)
    const redditMentions = [
      {
        platform: 'Reddit',
        content: 'r/StudyAbroad: LeapScholar vs other platforms - which one should I choose?',
        author: 'u/confused_applicant',
        timestamp: moment().subtract(1, 'day').toISOString(),
        engagement: 67,
        sentiment: sentiment.analyze('LeapScholar vs other platforms - which one should I choose?').score
      },
      {
        platform: 'Reddit',
        content: 'r/InternationalStudents: LeapScholar scholarship program is a game-changer!',
        author: 'u/success_story',
        timestamp: moment().subtract(2, 'days').toISOString(),
        engagement: 89,
        sentiment: sentiment.analyze('LeapScholar scholarship program is a game-changer!').score
      }
    ];

    // News mentions (simulated)
    const newsMentions = [
      {
        platform: 'News',
        content: 'LeapScholar partners with top universities to expand international student opportunities',
        author: 'Education Weekly',
        timestamp: moment().subtract(3, 'hours').toISOString(),
        engagement: 156,
        sentiment: sentiment.analyze('LeapScholar partners with top universities to expand international student opportunities').score
      }
    ];

    mentions.push(...twitterMentions, ...redditMentions, ...newsMentions);
    
    // Update global mentions
    brandMentions = [...mentions, ...brandMentions].slice(0, 100); // Keep last 100 mentions
    
    // Calculate sentiment trends
    const recentMentions = mentions.filter(m => 
      moment(m.timestamp).isAfter(moment().subtract(7, 'days'))
    );
    
    const avgSentiment = recentMentions.length > 0 
      ? recentMentions.reduce((sum, m) => sum + m.sentiment, 0) / recentMentions.length 
      : 0;
    
    sentimentTrends.push({
      date: moment().format('YYYY-MM-DD'),
      averageSentiment: avgSentiment,
      mentionCount: recentMentions.length
    });
    
    // Keep only last 30 days of trends
    sentimentTrends = sentimentTrends.slice(-30);
    
    // Emit real-time updates
    io.emit('mentionsUpdate', {
      mentions: brandMentions.slice(0, 10),
      trends: sentimentTrends,
      summary: generateSummary()
    });
    
    console.log(`Collected ${mentions.length} new mentions`);
    
  } catch (error) {
    console.error('Error collecting brand mentions:', error);
  }
}

// Generate insights summary
function generateSummary() {
  const recentMentions = brandMentions.filter(m => 
    moment(m.timestamp).isAfter(moment().subtract(24, 'hours'))
  );
  
  const positiveMentions = recentMentions.filter(m => m.sentiment > 0);
  const negativeMentions = recentMentions.filter(m => m.sentiment < 0);
  const neutralMentions = recentMentions.filter(m => m.sentiment === 0);
  
  const totalEngagement = recentMentions.reduce((sum, m) => sum + m.engagement, 0);
  const avgSentiment = recentMentions.length > 0 
    ? recentMentions.reduce((sum, m) => sum + m.sentiment, 0) / recentMentions.length 
    : 0;
  
  return {
    totalMentions: recentMentions.length,
    positiveMentions: positiveMentions.length,
    negativeMentions: negativeMentions.length,
    neutralMentions: neutralMentions.length,
    totalEngagement,
    averageSentiment: avgSentiment,
    topPlatforms: getTopPlatforms(recentMentions),
    trendingTopics: getTrendingTopics(recentMentions),
    alerts: generateAlerts(recentMentions)
  };
}

function getTopPlatforms(mentions) {
  const platformCount = {};
  mentions.forEach(m => {
    platformCount[m.platform] = (platformCount[m.platform] || 0) + 1;
  });
  return Object.entries(platformCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([platform, count]) => ({ platform, count }));
}

function getTrendingTopics(mentions) {
  const topics = [];
  mentions.forEach(m => {
    const words = m.content.toLowerCase().split(' ');
    words.forEach(word => {
      if (word.length > 3 && !['leapscholar', 'the', 'and', 'for', 'with'].includes(word)) {
        topics.push(word);
      }
    });
  });
  
  const topicCount = {};
  topics.forEach(topic => {
    topicCount[topic] = (topicCount[topic] || 0) + 1;
  });
  
  return Object.entries(topicCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));
}

function generateAlerts(mentions) {
  const alerts = [];
  
  // High negative sentiment alert
  const negativeMentions = mentions.filter(m => m.sentiment < -2);
  if (negativeMentions.length > 0) {
    alerts.push({
      type: 'negative_sentiment',
      message: `${negativeMentions.length} mentions with high negative sentiment detected`,
      priority: 'high',
      mentions: negativeMentions.slice(0, 3)
    });
  }
  
  // High engagement alert
  const highEngagement = mentions.filter(m => m.engagement > 50);
  if (highEngagement.length > 0) {
    alerts.push({
      type: 'high_engagement',
      message: `${highEngagement.length} mentions with high engagement (>50)`,
      priority: 'medium',
      mentions: highEngagement.slice(0, 3)
    });
  }
  
  return alerts;
}

// API Routes
app.get('/api/mentions', (req, res) => {
  res.json({
    mentions: brandMentions,
    trends: sentimentTrends,
    summary: generateSummary()
  });
});

app.get('/api/summary', (req, res) => {
  res.json(generateSummary());
});

// Schedule data collection every 30 minutes
cron.schedule('*/30 * * * *', collectBrandMentions);

// Initial data collection
collectBrandMentions();

// Socket connection
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send initial data
  socket.emit('mentionsUpdate', {
    mentions: brandMentions.slice(0, 10),
    trends: sentimentTrends,
    summary: generateSummary()
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`LeapScholar Brand Monitor running on port ${PORT}`);
  console.log(`Dashboard available at: http://localhost:${PORT}`);
}); 
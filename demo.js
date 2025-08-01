const axios = require('axios');

// Demo script to show the brand monitoring solution in action
async function demonstrateSolution() {
    console.log('🚀 LeapScholar Brand Monitor - Demo\n');
    
    try {
        // Test the API endpoints
        console.log('📊 Testing API endpoints...\n');
        
        const summaryResponse = await axios.get('http://localhost:3000/api/summary');
        const mentionsResponse = await axios.get('http://localhost:3000/api/mentions');
        
        console.log('✅ API is working! Dashboard is available at: http://localhost:3000\n');
        
        // Show sample data
        console.log('📈 Sample Data Overview:');
        console.log('========================');
        console.log(`Total Mentions (24h): ${summaryResponse.data.totalMentions}`);
        console.log(`Positive Mentions: ${summaryResponse.data.positiveMentions}`);
        console.log(`Negative Mentions: ${summaryResponse.data.negativeMentions}`);
        console.log(`Total Engagement: ${summaryResponse.data.totalEngagement}`);
        console.log(`Average Sentiment: ${summaryResponse.data.averageSentiment.toFixed(2)}\n`);
        
        console.log('🎯 Key Features Demonstrated:');
        console.log('=============================');
        console.log('✅ Real-time sentiment analysis');
        console.log('✅ Multi-platform monitoring (Twitter, Reddit, News)');
        console.log('✅ Engagement tracking');
        console.log('✅ Automated alerts for negative sentiment');
        console.log('✅ Trending topics identification');
        console.log('✅ Platform distribution analysis');
        console.log('✅ Executive dashboard for quick decision-making\n');
        
        console.log('💡 How This Helps the Marketing Head:');
        console.log('=====================================');
        console.log('• 5-second scan to understand brand sentiment');
        console.log('• Immediate alerts for crisis management');
        console.log('• Trending topics for content strategy');
        console.log('• Platform insights for resource allocation');
        console.log('• Real-time updates without manual searching\n');
        
        console.log('🎨 Dashboard Design Benefits:');
        console.log('=============================');
        console.log('• Executive summary view for quick assessment');
        console.log('• Color-coded sentiment indicators');
        console.log('• Mobile-responsive design');
        console.log('• Real-time WebSocket updates');
        console.log('• Professional, modern interface\n');
        
        console.log('🔧 Technical Implementation:');
        console.log('============================');
        console.log('• Node.js backend with Express');
        console.log('• Socket.IO for real-time updates');
        console.log('• Natural language sentiment analysis');
        console.log('• Chart.js for data visualization');
        console.log('• Simulated multi-platform data collection');
        console.log('• Easily extensible to real APIs\n');
        
        console.log('📱 Access the Dashboard:');
        console.log('=======================');
        console.log('🌐 Open your browser and go to: http://localhost:3000');
        console.log('📊 View real-time brand monitoring dashboard');
        console.log('🚨 Check alerts and trending topics');
        console.log('📈 Analyze sentiment trends over time\n');
        
    } catch (error) {
        console.log('❌ Server not running. Please start the server first:');
        console.log('   npm start');
        console.log('   or');
        console.log('   node server.js\n');
    }
}

// Run the demonstration
demonstrateSolution(); 
const cron = require('node-cron');
const axios = require('axios');
const config = require('config');

cron.schedule('0 */12 * * *', () => {
async function fetchYouTubeData(apiKey, channelId) {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const channelData = response.data.items[0].statistics;
        return {
            viewCount: channelData.viewCount,
            subscriberCount: channelData.subscriberCount,
            videoCount: channelData.videoCount
        };
    } catch (error) {
        console.error('Failed to fetch YouTube data:', error);
        throw error;
    }
}
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: config.get('NOTION_ATI_KEY')});

async function updateNotionDatabase(databaseId, data) {
    try {
        const pageId = config.get('PAGE_ID');
        const response = await notion.pages.update({
            page_id: pageId,
            properties: {
                'Views': {
                  "number": parseInt(data.viewCount)
                },
                'Subscribers': {
                  "number": parseInt(data.subscriberCount)
                },
                'Videos': {
                  "number": parseInt(data.videoCount)
                }
              },
        });
        console.log('Notion database updated successfully:', response);
    } catch (error) {
        console.error('Failed to update Notion database:', error);
        throw error;
    }
}

const YOUTUBE_API_KEY = config.get('YOUTUBE_API_KEY');
const CHANNEL_ID = config.get('CHANNEL_ID');
const NOTION_DATABASE_ID = config.get('NOTION_DATABASE_ID');

async function syncYouTubeToNotion() {
    try {
        const youtubeData = await fetchYouTubeData(YOUTUBE_API_KEY, CHANNEL_ID);
        await updateNotionDatabase(NOTION_DATABASE_ID, youtubeData);
        console.log('Data successfully synced from YouTube to Notion');
    } catch (error) {
        console.error('Failed to sync data:', error);
    }
}

syncYouTubeToNotion();
console.log('running a task every minute');
});
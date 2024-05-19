const cron = require('node-cron');
const axios = require('axios');
const config = require('config');
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: config.get('NOTION_ATI_KEY')});
const YOUTUBE_API_KEY = config.get('YOUTUBE_API_KEY');
const CHANNEL_ID = config.get('CHANNEL_ID');
const NOTION_DATABASE_ID = config.get('NOTION_DATABASE_ID');
const VIEWS_BLOCK_ID = config.get('VIEWS_BLOCK_ID')
const SUBSCRIBERS_BLOCK_ID = config.get('SUBSCRIBERS_BLOCK_ID')
const VIDEOS_BLOCK_ID = config.get('VIDEOS_BLOCK_ID')

cron.schedule('0 */6 * * *', () => {
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

async function updateNotionDatabase(databaseId, data) {
    try {
        const responseViews = await notion.blocks.update({
            "block_id": VIEWS_BLOCK_ID,
            "heading_2": {
                "rich_text": [
                    {
                        "text": {
                            "content": data.viewCount
                        },
                        "annotations": {
                            "color": "red"
                        }
                    }
                ]
            }
        });
        const responseSubscribers = await notion.blocks.update({
            "block_id": SUBSCRIBERS_BLOCK_ID,
            "heading_2": {
                "rich_text": [
                    {
                        "text": {
                            "content": data.subscriberCount
                        },
                        "annotations": {
                            "color": "green"
                        }
                    }
                ]
            }
        });
        const responseVideos = await notion.blocks.update({
            "block_id": VIDEOS_BLOCK_ID,
            "heading_2": {
                "rich_text": [
                    {
                        "text": {
                            "content": data.videoCount
                        },
                        "annotations": {
                            "color": "yellow"
                        }
                    }
                ]
            }
        });
        console.log('Notion database updated successfully:');
    } catch (error) {
        console.error('Failed to update Notion database:', error);
        throw error;
    }
}

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

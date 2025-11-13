const {
    ChartJSNodeCanvas
} = require('chartjs-node-canvas');
const {
    S3Client,
    PutObjectCommand
} = require('@aws-sdk/client-s3');
const path = require('path');
const {
    Chart
} = require('chart.js');

const width = 400;
const height = 400;
const backgroundColour = 'white';
const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour
});
// Register the font and set it as the default
chartJSNodeCanvas.registerFont(path.resolve(__dirname, 'NotoSansTC-Regular.ttf'), {
    family: 'Noto Sans TC'
});
Chart.defaults.font.family = 'Noto Sans TC';

const s3Client = new S3Client({});

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (e) {
        console.error("Failed to parse request body:", e);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Invalid JSON format in request body.'
            }),
        };
    }

    const {
        labels,
        data
    } = requestBody;

    if (!labels || !data || !Array.isArray(labels) || !Array.isArray(data) || labels.length !== data.length) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Invalid input. "labels" and "data" must be arrays of the same length.'
            }),
        };
    }

    const configuration = {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Dataset',
                data: data,
                backgroundColor: data.map(() => getRandomColor()),
            }],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Department Distribution'
                }
            }
        }
    };

    try {
        const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
        const bucketName = process.env.BUCKET_NAME;
        const region = process.env.AWS_REGION;
        const fileName = `chart-${Date.now()}.png`;

        const putObjectParams = {
            Bucket: bucketName,
            Key: fileName,
            Body: imageBuffer,
            ContentType: 'image/png',
        };

        await s3Client.send(new PutObjectCommand(putObjectParams));

        const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageUrl
            }),
        };
    } catch (error) {
        console.error('Error generating chart or uploading to S3:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to generate chart.',
                error: error.message
            }),
        };
    }
};
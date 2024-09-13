const redis = require('redis');
const redisClient = redis.createClient({
    url : process.env.REDIS_URL
});

redisClient.on('connect',()=>{
    redisClient.set('name','default',"EX",3600);
    console.log('Redis is running on localhost: ');
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

module.exports = redisClient;
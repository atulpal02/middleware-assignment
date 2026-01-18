const redisClient = require("./redisClient");



const RATE_LIMITS = {
  basic: { capacity: 10, refillRate: 10 / 180 },
  pro: { capacity: 100, refillRate: 100 / 180 }
};


function getTierFromApiKey(apiKey) {
  if (!apiKey) return null;
  
  if (apiKey.startsWith("sk_pro_")) return "pro";
  if (apiKey.startsWith("sk_basic_")) return "basic";

  return null;
}

const LUA_SCRIPT = `

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local data = redis.call(key, "tokens", "lastRefill")
local tokens = tonumber(data[1])
local lastRefill = tonumber(data[2])

if tokens == nil then
  tokens = capacity
  lastRefill = now
end

local timedifference = math.max(0, now - lastRefill)
local refill = timedifference * refillRate
tokens = math.min(capacity, tokens + refill)

if tokens < 1 then
  redis.call( key, "tokens", tokens, "lastRefill", now)
  return 0
end

tokens = tokens - 1
redis.call(key, "tokens", tokens, "lastRefill", now)
redis.call("EXPIRE", key, math.ceil(capacity / refillRate))
return 1
`;


async function rateLimiter(req, res, next) {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  const tier = getTierFromApiKey(apiKey);
  if (!tier) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  const limit = RATE_LIMITS[tier];
  const redisKey = `rate_limit:${apiKey}`;
  const now = Math.floor(Date.now() / 1000);

  try {
    const allowed = Number(
      await redisClient.eval(LUA_SCRIPT, {
        keys: [redisKey],
        arguments: [
          String(limit.capacity),
          String(limit.refillRate),
          String(now)
        ]
      })
    );

    if (allowed === 0) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        tier
      });
    }

    next();
  } catch (err) {
    console.error("Rate limiter error:", err);
    next(); 
  }
}

module.exports = rateLimiter;

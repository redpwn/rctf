%include 'chunk-call'

redis.call('SET', KEYS[1], ARGV[1])
local users = cjson.decode(ARGV[2])
for i = 1, #users do
  chunkCall('HSET', KEYS[i + 1], users[i])
end

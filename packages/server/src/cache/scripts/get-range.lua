local result = redis.call('LRANGE', KEYS[1], ARGV[1], ARGV[2])
result[#result + 1] = redis.call('LLEN', KEYS[1])
return result

%include 'chunk-call'

local leaderboard = cjson.decode(ARGV[1])
local divisions = cjson.decode(ARGV[2])
local challengeInfo = cjson.decode(ARGV[3])

local divisionBoards = {}
local divisionCounts = {}
local globalBoard = {}
local positionKeys = {}

for _, division in ipairs(divisions) do
  divisionBoards[division] = {}
  divisionCounts[division] = 0
end

local numUsers = #leaderboard / 4
for i = 1, numUsers do
  local division = leaderboard[i * 4 - 1]
  local divisionPosition = divisionCounts[division] + 1
  local divisionBoard = divisionBoards[division]

  divisionCounts[division] = divisionPosition
  divisionBoard[divisionPosition * 3] = leaderboard[i * 4]
  divisionBoard[divisionPosition * 3 - 1] = leaderboard[i * 4 - 2]
  divisionBoard[divisionPosition * 3 - 2] = leaderboard[i * 4 - 3]

  globalBoard[i * 3] = leaderboard[i * 4]
  globalBoard[i * 3 - 1] = leaderboard[i * 4 - 2]
  globalBoard[i * 3 - 2] = leaderboard[i * 4 - 3]

  positionKeys[i * 2] = leaderboard[i * 4] .. ',' .. i .. ',' .. divisionPosition
  positionKeys[i * 2 - 1] = leaderboard[i * 4 - 3]
end

redis.call('DEL', unpack(KEYS))
if #challengeInfo ~= 0 then
  chunkCall('HSET', KEYS[2], challengeInfo)
end
if numUsers ~= 0 then
  chunkCall('HSET', KEYS[1], positionKeys)
  chunkCall('RPUSH', KEYS[3], globalBoard)
  redis.call('SET', KEYS[4], ARGV[4])
  for i, division in ipairs(divisions) do
    local divisionBoard = divisionBoards[division]
    if #divisionBoard ~= 0 then
      chunkCall('RPUSH', KEYS[i + 4], divisionBoard)
    end
  end
end

import preactLocalStorage from 'preact-localstorage'

export const getChallenges = () => {
  const auth = preactLocalStorage.get('token', 'AUTH_TOKEN_HERE')
  console.log(auth)

  return []
}

import qs from 'qs'

const parse = (str: string) =>
  qs.parse(str, {
    allowDots: true,
    ignoreQueryPrefix: true,
  })

console.log('\n\n\n')
console.log('==============================================================')

// const queryString = '?age[eq]=12&name=piet&address.city[eq]=Drachten'
const queryString = '?filter[age][eq]=12&filter[name]=piet&filter[address][city][eq]=Drachten'
const parsed = parse(queryString)

console.dir(
  {
    queryString,
    parsed,
    filter: parsed.piet,
  },
  { depth: null, colors: true },
)

console.log('==============================================================')

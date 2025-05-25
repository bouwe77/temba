export const debug = (message: string, arg: unknown) => {
  console.log(message)
  console.dir(arg, { depth: null, colors: true })
}

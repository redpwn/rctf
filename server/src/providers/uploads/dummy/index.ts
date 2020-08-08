import { Provider } from '../../../uploads/provider'

export default class DummyProvider implements Provider {
  upload = async (): Promise<string> => ''
  getUrl = async (): Promise<string|null> => null
}

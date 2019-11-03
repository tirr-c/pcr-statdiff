import ApolloClient, { PresetConfig } from 'apollo-boost';

import BasicCharacterInfoQuery, { BasicCharacterInfoData } from '../graphql/BasicCharacterInfo';
import CharacterStatQuery, { CharacterStatData } from '../graphql/CharacterStat';
import Transport, { CharacterStatOptions } from '.';

export default class ApolloClientTransport implements Transport {
    private client: ApolloClient<any>;

    constructor(config?: PresetConfig) {
        this.client = new ApolloClient(config);
    }

    public async getBasicCharacterInfo(name: string) {
        const result = await this.client.query<BasicCharacterInfoData>({
            query: BasicCharacterInfoQuery,
            variables: { name },
        });
        return result.data.unit;
    }

    public async getCharacterStat(options: CharacterStatOptions) {
        const result = await this.client.query<CharacterStatData>({
            query: CharacterStatQuery,
            variables: options,
        });
        return result.data.unit;
    }
};

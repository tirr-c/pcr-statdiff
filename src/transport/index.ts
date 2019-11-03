import { BasicCharacterInfo, CharacterUnit } from '../common-types';

export interface CharacterStatOptions {
    name: string;
    rarity: number;
    rank: number;
}

export default interface Transport {
    getBasicCharacterInfo(name: string): Promise<BasicCharacterInfo | null>;
    getCharacterStat(options: CharacterStatOptions): Promise<CharacterUnit | null>;
}

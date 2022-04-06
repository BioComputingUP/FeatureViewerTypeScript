import { FeaturesList } from "./interfaces";
declare class Calculate {
    commons: any;
    private uniq;
    private orderBy;
    yxPoints(d: any): string;
    getTransf(el: any): any[];
    getMarginLeft(): number;
    addNLines(array: any): number;
    getHeightRect(level: any): number;
    searchTree(element: any, matchingId: any): any;
    unflatten: (array: FeaturesList, parent?: any, processedIds?: any, tree?: any) => {
        tree: any;
        ids: any;
    };
    flatten(features: any, flatted?: any[], parent?: any): any[];
    displaySequence(seq: any): boolean;
    updateSVGHeight(position: any): void;
    constructor(commons: {});
}
export default Calculate;

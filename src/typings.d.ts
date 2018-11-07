/*
 * Extra typings definitions
 */

// Allow .json files imports
declare module '*.json' {
    const value: any;
    export default value;
}

// SystemJS module definition
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare var Plotly: any;

declare var wcs:any;
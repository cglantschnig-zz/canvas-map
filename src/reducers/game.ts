import * as Konva from 'konva';

interface ReducerMapState {
  imageReference: HTMLImageElement;

  stage: Konva.Stage;
  imageLayer: Konva.Layer;
  contentLayer: Konva.Layer;

  backgroundHeight: number;
  backgroundWidth: number;
  backgroundX: number;
  backgroundY: number;
  backgroundImage: Konva.Image;

  currentZoom: number;
}

// ------------------------------------
// Constants
// ------------------------------------
export const MAP_INIT = "game/MAP_INIT";

// ------------------------------------
// Actions
// ------------------------------------
export function initMap (imageUrl) {
  return {
    type    : MAP_INIT,
    payload : imageUrl
  };
}

// ------------------------------------
// Action Handler
// ------------------------------------
const ACTION_HANDLERS = {
  [MAP_INIT]: (state, action) => {
    console.log(state);
    return state;
  }
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState : ReducerMapState = {
  imageReference: null,
  stage: null,
  imageLayer: null,
  contentLayer: null,
  backgroundHeight: 0,
  backgroundWidth: 0,
  backgroundX: 0,
  backgroundY: 0,
  backgroundImage: null,
  currentZoom: 1
};
export default function gameReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}

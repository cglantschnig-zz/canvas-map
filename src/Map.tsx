import * as React from 'react';
import * as Konva from 'konva';

export interface MapProps {
  zoom?: number;
  maxZoomFactor?: number;
  imageUrl: string;
}

export class Map extends React.Component<MapProps, undefined> {

  static canvasCounter: number = 1;
  static shapeCounter: number = 1;
  id: string = 'canvasMap_' + (Map.canvasCounter++);

  imageReference: HTMLImageElement;

  stage: Konva.Stage;           // complete stage
  imageLayer: Konva.Layer;      // layer only containing the image
  contentLayer: Konva.Layer;    // layer containing all the content

  height: number;               // height of the canvas element
  width: number;                // width of the canvas element

  backgroundHeight: number;     // height of the image
  backgroundWidth: number;      // width of the image
  backgroundX: number;          // x position of the image
  backgroundY: number;          // y position of the image
  backgroundImage: Konva.Image; // canvas image object

  previousEvent: MouseEvent;    // last event for dragging map function

  currentZoom: number;          // current Zoom Level
  drawingActive: boolean;       // currently pressed key
  drawingPoints: number[] = []; // array of current points (x, y, x1, y1, ...) in the painting line

  currentDrawing: Konva.Shape;  // current Shape used to draw
  currentColor: string = Konva.Util.getRandomColor();

  constructor(props : MapProps) {
    super(props);

    this.imageReference = new Image();
    this.imageReference.src = props.imageUrl;
  }

  static defaultProps = {
    zoom: 0.10,
    maxZoomFactor: 1.2
  }

  onResize = (event : Event) => {

    this.height = window.innerHeight;
    this.width = window.innerWidth;

    this.stage.setSize({
      height: this.height,
      width: this.width
    });

    // Prevent zooming out beyond the starting size
    if (this.backgroundWidth <= this.width || this.backgroundHeight <= this.height) {
      const fitRatio = Math.max(this.height / this.imageReference.height, this.width / this.imageReference.width);

      this.backgroundHeight = this.imageReference.height * fitRatio;
      this.backgroundWidth = this.imageReference.width * fitRatio;
    }

    this.updateBackground();
  }

  onWheel = (event : MouseWheelEvent) => {
    if (this.drawingActive || this.drawingPoints.length > 0) {
      return;
    }
    let deltaY = 0;

    event.preventDefault();

    if (event.deltaY) { // FireFox 17+ (IE9+, Chrome 31+?)
      deltaY = event.deltaY;
    } else if (event.wheelDelta) {
      deltaY = -event.wheelDelta;
    }

    // As far as I know, there is no good cross-browser way to get the cursor position relative to the event target.
    // We have to calculate the target element's position relative to the document, and subtrack that from the
    // cursor's position relative to the document.
    const rect = this.imageReference.getBoundingClientRect();
    const offsetX = event.pageX - rect.left - window.pageXOffset;
    const offsetY = event.pageY - rect.top - window.pageYOffset;

    // Record the offset between the bg edge and cursor:
    const bgCursorX = offsetX - this.backgroundX;
    const bgCursorY = offsetY - this.backgroundY;

    // Use the previous offset to get the percent offset between the bg edge and cursor:
    const bgRatioX = bgCursorX / this.backgroundWidth;
    const bgRatioY = bgCursorY / this.backgroundHeight;

    // Update the bg size:
    if (deltaY < 0) {
      this.backgroundWidth += this.backgroundWidth * this.props.zoom;
      this.backgroundHeight += this.backgroundHeight * this.props.zoom;
      // Dont let the zoom go beyond the image resolution
      if (this.backgroundWidth > this.imageReference.width * this.props.maxZoomFactor) {
        const downRatio = this.imageReference.width * this.props.maxZoomFactor / this.backgroundWidth;
        this.backgroundWidth *= downRatio;
        this.backgroundHeight *= downRatio;
      }
    } else {
      this.backgroundWidth -= this.backgroundWidth * this.props.zoom;
      this.backgroundHeight -= this.backgroundHeight * this.props.zoom;
    }

    // Prevent zooming out beyond the starting size
    if (this.backgroundWidth <= this.width || this.backgroundHeight <= this.height) {
      const fitRatio = Math.max(this.height / this.imageReference.height, this.width / this.imageReference.width);

      this.backgroundHeight = this.imageReference.height * fitRatio;
      this.backgroundWidth = this.imageReference.width * fitRatio;
    }

    // Take the percent offset and apply it to the new size:
    this.backgroundX = offsetX - (this.backgroundWidth * bgRatioX);
    this.backgroundY = offsetY - (this.backgroundHeight * bgRatioY);

    this.updateBackground();
  }

  /**
   * function to redraw the background
   * this function is also responsible for updating the children
   */
  updateBackground = () => {
    if (this.backgroundX > 0) {
      this.backgroundX = 0;
    } else if (this.backgroundX < this.width - this.backgroundWidth) {
      this.backgroundX = this.width - this.backgroundWidth;
    }

    if (this.backgroundY > 0) {
      this.backgroundY = 0;
    } else if (this.backgroundY < this.height - this.backgroundHeight) {
      this.backgroundY = this.height - this.backgroundHeight;
    }

    this.currentZoom = Math.max(this.backgroundHeight / this.imageReference.height, this.backgroundWidth / this.imageReference.width);

    this.backgroundImage
      .setAbsolutePosition({
        x: this.backgroundX,
        y: this.backgroundY
      })
      .setSize({
        height: this.backgroundHeight,
        width: this.backgroundWidth
      });
    this.imageLayer.batchDraw();

    this.contentLayer.clear();
    this.contentLayer.setAbsolutePosition({
      x: this.backgroundX,
      y: this.backgroundY
    })
    this.contentLayer.scale({
      x: this.currentZoom,
      y: this.currentZoom
    });
    this.contentLayer.draw();
  }

  drag = (event : MouseEvent) => {
    event.preventDefault();
    this.backgroundX += (event.pageX - this.previousEvent.pageX);
    this.backgroundY += (event.pageY - this.previousEvent.pageY);
    this.previousEvent = event;
    this.updateBackground();
  }

  removeDrag = () => {
    window.removeEventListener('mousemove', this.drag);
    window.removeEventListener('mouseup', this.removeDrag);
  }

  // Make the background draggable
  onMouseDown = (event : MouseEvent) => {
    event.preventDefault();
    // if we are in drawing mode, we dont want to pan the map
    if (this.drawingActive && this.drawingPoints.length > 0) {
      return;
    }
    this.previousEvent = event;
    window.addEventListener('mousemove', this.drag);
    window.addEventListener('mouseup', this.removeDrag);
  }

  onKeyDown = (event : KeyboardEvent) => {
    if (event.shiftKey) {
      this.drawingActive = true;
      this.backgroundImage.on('mousedown', this.addPoint);
      window.addEventListener('keyup', this.onKeyUp);
    }
    this.drawingActive = false;
  }

  onKeyUp = (event : KeyboardEvent) => {
    this.drawingActive = false;
    this.backgroundImage.off('mousedown');
    window.removeEventListener('keyup', this.onKeyUp);
    if (this.drawingPoints.length === 0) {
      return;
    }
    this.contentLayer.add(new Konva.Line({
      points: this.drawingPoints,
      id: 'test' + (Map.shapeCounter++)
    }));
    this.contentLayer.draw();
    this.drawingPoints = [];
    this.currentColor = Konva.Util.getRandomColor();
  }

  addPoint = (e : any) => {
    const event : MouseEvent = e.evt;

    const x = (-this.backgroundX + event.pageX) / this.currentZoom;
    const y = (-this.backgroundY + event.pageY) / this.currentZoom;

    this.drawingPoints.push(x);
    this.drawingPoints.push(y);

    this.contentLayer.add(new Konva.Line({
      points: this.drawingPoints,
      fill: this.currentColor,
      stroke: 'black',
      strokeWidth: 1,
      closed : true,
      id: 'test' + Map.shapeCounter
    }));
    this.contentLayer.draw();

  }

  load = () => {
    this.height = window.innerHeight;
    this.width = window.innerWidth;

    const fitRatio = Math.max(this.height / this.imageReference.height, this.width / this.imageReference.width);

    this.backgroundHeight = this.imageReference.height * fitRatio;
    this.backgroundWidth = this.imageReference.width * fitRatio;

    this.backgroundX = (this.width - this.backgroundWidth) / 2;
    this.backgroundY = (this.height - this.backgroundHeight) / 2;

    this.currentZoom = fitRatio;

    this.backgroundImage = new Konva.Image({
        x: this.backgroundX,
        y: this.backgroundY,
        image: this.imageReference,
        width: this.backgroundWidth,
        height: this.backgroundHeight
    });

    window.addEventListener('wheel', this.onWheel);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);

    this.stage = new Konva.Stage({
      container: this.id,
      width: this.width,
      height: this.height
    });
    this.imageLayer = new Konva.Layer();
    this.contentLayer = new Konva.Layer({
      x: this.backgroundX,
      y: this.backgroundY
    });
    this.contentLayer.scale({
      x: this.currentZoom,
      y: this.currentZoom
    });

    this.imageLayer.add(this.backgroundImage);
    this.stage.add(this.imageLayer);
    this.stage.add(this.contentLayer);
  }

  componentWillUnmount() {
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  componentDidMount() {
    if (this.imageReference.complete) {
      this.load();
    }
    this.imageReference.addEventListener('load', this.load.bind(this));
  }

  render() {
    return (
      <div id={this.id}>
      </div>
    );
  }
}

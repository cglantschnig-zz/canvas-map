import * as React from 'react';
import * as Konva from 'konva';

export interface MapProps {
  zoom?: number;
  maxZoomFactor?: number;
  imageUrl: string;
}

export class Map extends React.Component<MapProps, undefined> {

  id: string = 'test';

  imageReference: HTMLImageElement;

  stage: Konva.Stage;
  layer: Konva.Layer;

  height: number; // height of the canvas element
  width: number; // width of the canvas element

  backgroundHeight: number;     // height of the image
  backgroundWidth: number;      // width of the image
  backgroundX: number;          // x position of the image
  backgroundY: number;          // y position of the image
  backgroundImage: Konva.Image; // canvas image object

  previousEvent: MouseEvent;

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

  onWheel = (e : any) => {
    const event : MouseWheelEvent = e.evt;

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

    this.backgroundImage
      .setAbsolutePosition({
        x: this.backgroundX,
        y: this.backgroundY
      })
      .setSize({
        height: this.backgroundHeight,
        width: this.backgroundWidth
      })
      .draw();
  }

  drag = (e) => {
    const event : MouseEvent = e.evt;
    event.preventDefault();
    this.backgroundX += (event.pageX - this.previousEvent.pageX);
    this.backgroundY += (event.pageY - this.previousEvent.pageY);
    this.previousEvent = event;
    this.updateBackground();
  }

  removeDrag = () => {
    this.backgroundImage.off('mousemove');
    this.backgroundImage.off('mouseup');
  }

  // Make the background draggable
  draggable = (e) => {
    const event : MouseEvent = e.evt;
    event.preventDefault();
    this.previousEvent = event;
    this.backgroundImage.on('mousemove', this.drag.bind(this));
    this.backgroundImage.on('mouseup', this.removeDrag.bind(this));
  }

  load = () => {
    this.height = window.innerHeight;
    this.width = window.innerWidth;

    const fitRatio = Math.max(this.height / this.imageReference.height, this.width / this.imageReference.width);

    this.backgroundHeight = this.imageReference.height * fitRatio;
    this.backgroundWidth = this.imageReference.width * fitRatio;

    this.backgroundX = (this.width - this.backgroundWidth) / 2;
    this.backgroundY = (this.height - this.backgroundHeight) / 2;

    this.backgroundImage = new Konva.Image({
        x: this.backgroundX,
        y: this.backgroundY,
        image: this.imageReference,
        width: this.backgroundWidth,
        height: this.backgroundHeight
    });

    this.backgroundImage.on('wheel', this.onWheel);
    this.backgroundImage.on('mousedown', this.draggable);
    window.addEventListener('resize', this.onResize);

    this.stage = new Konva.Stage({
      container: this.id,
      width: this.width,
      height: this.height
    });
    this.layer = new Konva.Layer();

    this.layer.add(this.backgroundImage);
    this.stage.add(this.layer);
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

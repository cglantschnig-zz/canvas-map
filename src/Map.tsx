import * as React from 'react';
import * as Konva from 'konva';

export interface MapProps {
  compiler: string;
  framework: string;
}

// https://github.com/jackmoore/wheelzoom/blob/master/wheelzoom.js

export class Map extends React.Component<MapProps, undefined> {

  id: string = 'test';
  stage: Konva.Stage;
  layer: Konva.Layer;

  backgroundImage: Konva.Image;
  imageObj: HTMLImageElement;

  height: number;
  width: number;
  x: number = 0;
  y: number = 0;

  zoomLevel: number = 0.05;
  zoom: number = 1;

  resize = (event : Event) => {

    const ratioX = this.width / window.innerWidth;
    const ratioY = this.width / window.innerHeight;

    this.x /= ratioX;
    this.y /= ratioY;

    this.setSizes();
    this.checkBorders();
    this.draw();
  }

  setSizes = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.stage.setSize({
      width: this.width,
      height: this.height
    });
  }

  draw = () => {
    this.backgroundImage
      .setSize({
        width: this.imageObj.width * this.zoom,
        height: this.imageObj.height * this.zoom
      })
      .setAbsolutePosition({
        x: this.x,
        y: this.y
      })
      .draw();
  }

  scroll = (event : MouseWheelEvent) => {

    var zoomChange = 0;

    event.preventDefault();

    if (event.deltaY) { // FireFox 17+ (IE9+, Chrome 31+?)
      zoomChange = event.deltaY;
    } else if (event.wheelDelta) {
      zoomChange = -event.wheelDelta;
    }

    const deltaX = event.pageX - (this.width / 2);
    const deltaY = event.pageY - (this.height / 2);

    this.x -= deltaX;
    this.y -= deltaY;

    // Update the bg size:
    if (zoomChange < 0) {
      this.zoom += this.zoomLevel;
    } else {
      this.zoom -= this.zoomLevel;
    }

    this.checkBorders();
    this.draw();
  }

  dragMap = () => {

    let position = null;

    this.backgroundImage.on('mousemove', (e) => {
      const event = e.evt;
      if (position) {
        this.x += event.clientX - position.x;
        this.y += event.clientY - position.y;

        this.checkBorders();
        this.draw();
      }

      position = {
        x: event.clientX,
        y: event.clientY
      };

      this.backgroundImage.on('mouseup', () => {
        this.backgroundImage.off('mousemove');
        this.backgroundImage.off('mouseup');
      });
    });
  }

  checkBorders = () => {
    this.x = this.x > 0 ? 0 : this.x;
    this.y = this.y > 0 ? 0 : this.y;

    this.x = this.x < (this.width - this.imageObj.width * this.zoom) ? (this.width - this.imageObj.width * this.zoom) : this.x;
    this.y = this.y < (this.height - this.imageObj.height * this.zoom) ? (this.height - this.imageObj.height * this.zoom) : this.y;
  }

  componentDidMount() {
    this.stage = new Konva.Stage({
      container: this.id
    });

    this.setSizes();

    this.layer = new Konva.Layer();

    this.imageObj = new Image();
    this.imageObj.onload = () => {

      this.zoom = Math.max(this.height / this.imageObj.height, this.width / this.imageObj.width);

      this.x = (this.width - this.imageObj.width * this.zoom) / 2;
      this.y = (this.height - this.imageObj.height * this.zoom) / 2;

      this.backgroundImage = new Konva.Image({
        x: this.x,
        y: this.y,
        image: this.imageObj,
        width: this.imageObj.width * this.zoom,
        height: this.imageObj.height * this.zoom
      });
      // add the shape to the layer
      this.layer.add(this.backgroundImage);
      // add the layer to the stage
      this.stage.add(this.layer);

      this.backgroundImage.on('mousedown', this.dragMap.bind(this));
    };
    this.imageObj.src = require('./test.jpg');

    // add the layer to the stage
    this.stage.add(this.layer);

    window.addEventListener('resize', this.resize.bind(this), false);
    window.addEventListener('mousewheel', this.scroll.bind(this), false);
  }

  render() {

    return (
      <div id={this.id}>
      </div>
    );
  }
}

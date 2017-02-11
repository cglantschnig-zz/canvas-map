import * as React from 'react';
import * as Konva from 'konva';

export interface MapProps {
  compiler: string;
  framework: string;
}

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


  resize = (event : Event) => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.stage.setSize({
      width: this.width,
      height: this.height
    });
  }

  dragMap = () => {

    let position = null;

    this.backgroundImage.on('mousemove', (e) => {
      const event = e.evt;
      if (position) {
        this.x += event.clientX - position.x;
        this.y += event.clientY - position.y;
        if (this.x > 0) {
          this.x = 0;
        }
        if (this.y > 0) {
          this.y = 0;
        }
        if (((-1) * this.x + this.width) > this.imageObj.width) {
          this.x = (this.imageObj.width - this.width) * -1;
        }
        if (((-1) * this.y + this.height) > this.imageObj.height) {
          this.y = (this.imageObj.height - this.height) * -1;
        }
        this.backgroundImage.setAbsolutePosition({
          x: this.x,
          y: this.y
        });
        this.backgroundImage.draw();
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

  componentDidMount() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.stage = new Konva.Stage({
      container: this.id,
      width: this.width,
      height: this.height
    });

    this.layer = new Konva.Layer();

    this.imageObj = new Image();
    this.imageObj.onload = () => {

      let ratio = 1;

      if (this.imageObj.height < this.height) {
        ratio = this.height / this.imageObj.height;
      }

      this.backgroundImage = new Konva.Image({
        x: 0,
        y: 0,
        image: this.imageObj,
        width: this.imageObj.width * ratio,
        height: this.imageObj.height * ratio
      });
      // add the shape to the layer
      this.layer.add(this.backgroundImage);
      // add the layer to the stage
      this.stage.add(this.layer);

      this.backgroundImage.on('mousedown', this.dragMap.bind(this))
    };
    this.imageObj.src = require('./test.jpg');

    // add the layer to the stage
    this.stage.add(this.layer);

    window.addEventListener("resize", this.resize.bind(this), false);
  }

  render() {

    return (
      <div id={this.id}>
      </div>
    );
  }
}

import { area } from 'd3';
import Plot from './plot';
import { PlotData, AreaPlotOptions } from './interfaces';
import { D3Scale } from '../common/interfaces';

/**
 * Area plot
 */
export default class AreaPlot extends Plot {
  options: AreaPlotOptions;
  scale: D3Scale;
  data: PlotData;

  /**
   * Renders area plot to canvas context
   * @param ctx canvas context instance
   * @param scale y-scale
   */
  plot(ctx: CanvasRenderingContext2D, scale: D3Scale) : void {
    const {
      scale: xscale,
      data: plotdata,
      options,
    } = this;

    if (!xscale || options.hidden) return;

    const useMinAsBase = options.useMinAsBase === undefined ? true : options.useMinAsBase;

    const [dmin, dmax] = xscale.domain();
    const zeroValue = xscale(
      useMinAsBase ? Math.min(dmin, dmax) : Math.max(dmin, dmax),
    );

    ctx.save();

    const areaFunction = area()
      .defined(d => options.defined(d[1], d[0]))
      .context(ctx);

    if (options.horizontal) {
      areaFunction
        .y1(d => xscale(d[1]))
        .y0(zeroValue)
        .x(d => scale(d[0]));
    } else {
      areaFunction
        .x1(d => xscale(d[1]))
        .x0(zeroValue)
        .y(d => scale(d[0]));
    }

    ctx.globalAlpha = options.fillOpacity || 1;

    if (options.inverseColor) {
      const inverseValue = xscale(
        useMinAsBase ? Math.max(dmin, dmax) : Math.min(dmin, dmax),
      );

      const inverseAreaFunction = area()
        .defined(d => options.defined(d[1], d[0]))
        .context(ctx);

      if (options.horizontal) {
        inverseAreaFunction
          .y1(d => Math.max(0, xscale(d[1])))
          .y0(inverseValue)
          .x(d => scale(d[0]));
      } else {
        inverseAreaFunction
          .x1(d => Math.max(0, xscale(d[1])))
          .x0(inverseValue)
          .y(d => scale(d[0]));
      }
      ctx.beginPath();
      inverseAreaFunction(plotdata);
      ctx.fillStyle = options.inverseColor;
      ctx.fill();
    }

    ctx.beginPath();
    areaFunction(plotdata);
    ctx.lineWidth = options.width;

    ctx.fillStyle = options.fill || options.color;
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.strokeStyle = options.color;
    ctx.stroke();

    ctx.restore();
  }
}

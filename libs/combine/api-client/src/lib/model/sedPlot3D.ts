/**
 * BioSimulations COMBINE service
 * Endpoints for working with COMBINE/OMEX archives and model (e.g., SBML) and simulation (e.g., SED-ML) files that they typically contain.  Note, this API may change significantly in the future.
 *
 * The version of the OpenAPI document: 0.1
 * Contact: info@biosimulations.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { SedAxisScale } from './sedAxisScale';
import { SedSurface } from './sedSurface';

/**
 * Specifications for a 3D surface plot.
 */
export interface SedPlot3D {
  /**
   * Unique id within its parent SED document.
   */
  id: string;
  /**
   * Brief description.
   */
  name?: string;
  /**
   * List of surfaces (tuples of x, y, and z data).
   */
  surfaces: Array<SedSurface>;
  xScale: SedAxisScale;
  yScale: SedAxisScale;
  zScale: SedAxisScale;
  /**
   * Type of the output.
   */
  _type: SedPlot3D.TypeEnum;
}
export namespace SedPlot3D {
  export type TypeEnum = 'SedPlot3D';
  export const TypeEnum = {
    SedPlot3D: 'SedPlot3D' as TypeEnum,
  };
}

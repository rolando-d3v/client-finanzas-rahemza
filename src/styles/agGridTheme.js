import { themeQuartz } from "ag-grid-community";

/**
 * Tema AG Grid alineado con los tokens de color.css.
 * Usa Theme Modes (light/dark) + data-ag-theme-mode en html/body
 * para que la tabla siga el mismo toggle que el resto de la app.
 *
 * @see https://www.ag-grid.com/react-data-grid/theming-colors/#theme-modes
 */
const gridThemeParams = {
  backgroundColor: "var(--color-fondo-card)",
  foregroundColor: "var(--color-texto-body)",
  dataBackgroundColor: "var(--color-fondo-card)",
  headerBackgroundColor: "var(--color-fondo-input)",
  headerTextColor: "var(--color-texto-secundario)",
  textColor: "var(--color-texto-body)",
  borderColor: "var(--color-borde-suave)",
  rowHoverColor: "var(--color-fondo-hover)",
  oddRowBackgroundColor: "var(--color-fondo-card)",
  accentColor: "var(--color-primario)",
  selectedRowBackgroundColor: "var(--color-primario-suave)",
};

export const gastosAgGridTheme = themeQuartz
  .withParams({ ...gridThemeParams, browserColorScheme: "light" }, "light")
  .withParams({ ...gridThemeParams, browserColorScheme: "dark" }, "dark");

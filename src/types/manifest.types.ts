export interface Manifest {
  id: string;             // Unique identifier for the app
  version: string;        // Semantic version of the app
  name: string;           // Name of the app
  description: string;    // Description of the app
  ui_extension: {
    views: Array<{
      viewport: string;   // Specifies where the view will be displayed
      component: string;  // The component associated with the view
    }>;
  };
}
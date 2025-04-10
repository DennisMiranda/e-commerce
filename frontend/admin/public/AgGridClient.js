document.addEventListener("DOMContentLoaded", function () {
  const loadTable = async () => {
    // Row Data Interface

    // Grid API: Access to Grid API methods
    let gridApi;

    try {
      const res = await fetch("http://localhost:3000/products");
      const products = await res.json();

      console.log(products);

      // Grid Options: Contains all of the grid configurations
      const gridOptions = {
        rowData: products,
        // Columns to be displayed
        columnDefs: [
          { field: "id", headerName: "ID" },
          { field: "category", headerName: "Categoría" },
          { field: "name", headerName: "Nombre" },
          { field: "brand", headerName: "Marca" },
          { field: "description", headerName: "Descripción" },
          { field: "price", headerName: "Precio" },
          { field: "stock", headerName: "Cantidad" },
        ],
        defaultColDef: {
          flex: 1,
        },
        autoSizeStrategy: {
          type: "fitCellContents",
        },
        theme:
          agGrid.themeQuartz?.withParams?.({ wrapperBorder: false }) ||
          undefined,
      };
      // Create Grid: Create new grid within the #myGrid div, using the Grid Options object
      const container = document.querySelector("#myGrid");
      if (container) gridApi = agGrid.createGrid(container, gridOptions);
    } catch (error) {
      console.log(error);
    }
  };

  loadTable();
});

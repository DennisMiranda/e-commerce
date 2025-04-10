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
        // Data to be displayed
        rowData: products,
        // Columns to be displayed (Should match rowData properties)
        columnDefs: [
          { field: "id" },
          { field: "name" },
          { field: "brand" },
          { field: "price" },
        ],
        defaultColDef: {
          flex: 1,
        },
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

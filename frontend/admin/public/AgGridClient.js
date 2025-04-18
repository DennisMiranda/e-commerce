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
          { field: "id", headerName: "ID", filter: "agNumberColumnFilter" },
          {
            field: "category",
            headerName: "Categoría",
            filter: "agTextColumnFilter",
          },
          { field: "name", headerName: "Nombre", filter: "agTextColumnFilter" },
          { field: "brand", headerName: "Marca", filter: "agTextColumnFilter" },
          {
            field: "description",
            headerName: "Descripción",
            filter: "agTextColumnFilter",
          },
          {
            field: "price",
            headerName: "Precio",
            filter: "agNumberColumnFilter",
          },
          {
            field: "stock",
            headerName: "Cantidad",
            filter: "agNumberColumnFilter",
          },
          {
            field: "status",
            headerName: "Estatus",
            filter: "agNumberColumnFilter",
          },
          { field: "image", headerName: "Imagen" },
          {
            field: "actions",
            headerName: "Acciones",
            cellRenderer: (params) => {
              return `<div class="flex items-center h-full gap-3">
              <button class="edit-btn min-w-10 text-center  bg-aside-bg text-text-primary px-3 py-2 rounded-md hover:bg-text-primary hover:text-white transition" 
              data-id="${params.data.id}"> <img src="/icons/edit.svg" alt="Edit" width="18" height="18" /></button>
              <button class="delete-btn min-w-10 text-center  bg-aside-bg text-text-primary px-3 py-2 rounded-md hover:bg-text-primary hover:text-white transition"
              data-id="${params.data.id}"> <img src="/icons/delete.svg" alt="Delete" width="16" height="16"/></button>
              </div>
            `;
            },
          },
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
        pagination: true,
        paginationPageSize: 10,
        paginationPageSizeSelector: [10, 20, 50, 100],
        localeText: window.localeText,
      };
      // Create Grid: Create new grid within the #myGrid div, using the Grid Options object
      const container = document.querySelector("#myGrid");
      if (container) gridApi = agGrid.createGrid(container, gridOptions);
    } catch (error) {
      console.log(error);
    }
  };

  loadTable();
  // Detectar y reemplazar "Page Size" dinámicamente
  const observer = new MutationObserver(() => {
    const labels = document.querySelectorAll(".ag-paging-page-size .ag-label");
    labels.forEach((label) => {
      if (label.textContent.trim() === "Page Size:") {
        label.textContent = "Mostrar:";
        observer.disconnect(); // dejamos de observar una vez traducido
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});

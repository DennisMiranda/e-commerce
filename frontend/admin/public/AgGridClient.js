document.addEventListener("DOMContentLoaded", function () {
  const loadTable = async () => {
    // Grid API: Access to Grid API methods
    let gridApi;

    try {
      const res = await fetch("http://localhost:3000/products");
      const products = await res.json();

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
          { field: "image", headerName: "Imagen", minWidth: 100 },
          {
            field: "actions",
            headerName: "Acciones",
            pinned: "right",
            cellRenderer: (params) => {
              // Crear el contenedor para los botones
              const container = document.createElement("div");
              container.className = "flex items-center h-full gap-3"; // Contenedor para los botones

              // Crear botón de edición
              const editButton = document.createElement("button");
              editButton.className =
                "edit-btn min-w-10 text-center bg-aside-bg text-text-primary px-3 py-2 rounded-md hover:bg-text-primary hover:text-white transition";
              editButton.dataset.id = params.data.id;
              editButton.innerHTML = `<img src="/icons/edit.svg" alt="Edit" width="18" height="18" />`;
              editButton.addEventListener("click", () => {
                window.openEditModal(params.data); // Pasamos params.data al modal de edición
              });

              // Crear botón de eliminación
              const deleteButton = document.createElement("button");
              deleteButton.className =
                "delete-btn min-w-10 text-center bg-aside-bg text-text-primary px-3 py-2 rounded-md hover:bg-text-primary hover:text-white transition";
              deleteButton.dataset.id = params.data.id;
              deleteButton.innerHTML = `<img src="/icons/delete.svg" alt="Delete" width="16" height="16" />`;
              deleteButton.addEventListener("click", () => {
                // Aquí puedes manejar la eliminación o cualquier otra acción
                console.log("Eliminando producto con ID:", params.data.id);
              });

              // Agregar los botones al contenedor
              container.appendChild(editButton);
              container.appendChild(deleteButton);

              return container; // Devuelve el contenedor con ambos botones
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

      // Crear Tabla en  #myGrid div, usando grid options
      const container = document.querySelector("#myGrid");
      if (container) {
        gridApi = agGrid.createGrid(container, gridOptions);
        window.gridApi = gridApi;
        // Agregamos el evento de "firstDataRendered" manualmente (esto sí es compatible con AG Grid Community)
        // gridApi.addEventListener("firstDataRendered", () => {
        //   attachEditButtonListeners(); // Llamamos la función para añadir los listeners después de que se haya renderizado la primera vez.
        // });
      }
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

// Función para asociar el evento al boton de edición
function attachEditButtonListeners() {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const productId = btn.dataset.id;
      const modal = document.getElementById("modal-form");
      const form = modal.querySelector("form");

      try {
        const res = await fetch(`http://localhost:3000/products/${productId}`);
        const product = await res.json();

        // Asumimos que el backend devuelve un solo objeto (no en un array)
        form["product-name"].value = product.name;
        form["product-brand"].value = product.brand;
        form["product-description"].value = product.description;
        form["product-price"].value = product.price;
        form["product-stock"].value = product.stock;
        form["select-category"].value = product.categories_id;

        // Ocultar campo de estatus si existe (solo en modo agregar)
        const statusField = form.querySelector('[name="product-status"]');
        if (statusField) {
          statusField.closest(".mb-4").style.display = "none";
        }

        modal.dataset.mode = "edit";
        modal.dataset.id = productId;
        modal.style.display = "block";
      } catch (err) {
        console.error("Error al cargar el producto:", err);
        alert("No se pudo cargar el producto para editar.");
      }
    });
  });
}

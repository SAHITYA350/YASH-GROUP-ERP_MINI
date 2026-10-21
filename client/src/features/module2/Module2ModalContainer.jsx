// client/src/features/module2/Module2ModalContainer.jsx
import React from 'react';
import {
  CreateVendorModal,
  CreatePOModal,
  CreatePRModal,
  CreateGRNModal,
  StockMoveModal,
} from '../../components/common/Module2Modals';

export default function Module2ModalContainer({
  modalType,
  onClose,
  module2State,
  module2Actions,
  lookups,
}) {
  const {
    vendors,
    purchaseOrders,
    inventory,
    selectedVendor,
    setSelectedVendor,
  } = module2State;

  const {
    handleSaveVendor,
    handleCreatePO,
    handleCreatePR,
    handleCreateGRN,
    handleRecordStockMovement,
  } = module2Actions;

  if (!modalType) return null;

  return (
    <>
      {(modalType === 'CREATE_VENDOR' || modalType === 'EDIT_VENDOR') && (
        <CreateVendorModal
          initialData={selectedVendor}
          onClose={() => {
            setSelectedVendor(null);
            onClose();
          }}
          onSubmit={(data) => handleSaveVendor(data, onClose)}
        />
      )}

      {modalType === 'CREATE_PO' && (
        <CreatePOModal
          vendors={vendors}
          products={lookups.products}
          onClose={onClose}
          onSubmit={(poData) => handleCreatePO(poData, onClose)}
        />
      )}

      {modalType === 'CREATE_PR' && (
        <CreatePRModal
          products={lookups.products}
          onClose={onClose}
          onSubmit={(prData) => handleCreatePR(prData, onClose)}
        />
      )}

      {modalType === 'CREATE_GRN' && (
        <CreateGRNModal
          purchaseOrders={purchaseOrders}
          vendors={vendors}
          onClose={onClose}
          onSubmit={(grnData) => handleCreateGRN(grnData, onClose)}
        />
      )}

      {modalType === 'STOCK_MOVE' && (
        <StockMoveModal
          inventory={inventory}
          products={lookups.products}
          onClose={onClose}
          onSubmit={(moveData) => handleRecordStockMovement(moveData, onClose)}
        />
      )}
    </>
  );
}

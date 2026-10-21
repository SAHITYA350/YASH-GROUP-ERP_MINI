// client/src/features/module2/useModule2.js
import { useState, useCallback } from 'react';
import { erpApi } from '../../services/api';

export function useModule2(toast) {
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [goodsReceipts, setGoodsReceipts] = useState([]);
  const [movements, setMovements] = useState([]);

  const [selectedVendor, setSelectedVendor] = useState(null);

  const fetchModule2Data = useCallback(async () => {
    try {
      const [resVendors, resPOs, resPRs, resInv, resGRNs, resMoves] = await Promise.all([
        erpApi.getVendors().catch(() => null),
        erpApi.getPurchaseOrders().catch(() => null),
        erpApi.getPurchaseRequests().catch(() => null),
        erpApi.getInventory().catch(() => null),
        erpApi.getGoodsReceipts().catch(() => null),
        erpApi.getInventoryMovements().catch(() => null),
      ]);

      if (resVendors?.success) setVendors(resVendors.data || []);
      if (resPOs?.success) setPurchaseOrders(resPOs.data || []);
      if (resPRs?.success) setPurchaseRequests(resPRs.data || []);
      if (resInv?.success) setInventory(resInv.data || []);
      if (resGRNs?.success) setGoodsReceipts(resGRNs.data || []);
      if (resMoves?.success) setMovements(resMoves.data || []);
    } catch (err) {
      console.error('Error fetching Module 2 data:', err);
    }
  }, []);

  const handleSaveVendor = async (data, onSuccess) => {
    try {
      if (data.id) {
        await erpApi.updateVendor(data.id, data);
        toast(`Vendor ${data.name} updated successfully!`);
      } else {
        await erpApi.createVendor(data);
        toast(`Vendor ${data.name} registered successfully!`);
      }
      setSelectedVendor(null);
      if (onSuccess) onSuccess();
      fetchModule2Data();
    } catch (err) {
      alert(`Error saving vendor: ${err.message}`);
    }
  };

  const handleCreatePO = async (poData, onSuccess) => {
    try {
      const res = await erpApi.createPurchaseOrder(poData);
      toast(`Purchase Order ${res.data?.poNumber || ''} created successfully!`);
      if (onSuccess) onSuccess();
      fetchModule2Data();
    } catch (err) {
      alert(`Error creating Purchase Order: ${err.message}`);
    }
  };

  const handleCreatePR = async (prData, onSuccess) => {
    try {
      const res = await erpApi.createPurchaseRequest(prData);
      toast(`Purchase Request ${res.data?.prNumber || res.data?.requestNo || ''} submitted!`);
      if (onSuccess) onSuccess();
      fetchModule2Data();
    } catch (err) {
      alert(`Error creating Purchase Request: ${err.message}`);
    }
  };

  const handleUpdatePOStatus = async (id, status) => {
    try {
      await erpApi.updatePOStatus(id, status);
      toast(`PO status updated to ${status}`);
      fetchModule2Data();
    } catch (err) {
      alert(`Error updating PO status: ${err.message}`);
    }
  };

  const handleCreateGRN = async (grnData, onSuccess) => {
    try {
      const res = await erpApi.createGoodsReceipt(grnData);
      toast(`GRN ${res.data?.receiptNumber || res.data?.grnNumber || ''} processed & inventory updated!`);
      if (onSuccess) onSuccess();
      fetchModule2Data();
    } catch (err) {
      alert(`Error recording GRN: ${err.message}`);
    }
  };

  const handleRecordStockMovement = async (moveData, onSuccess) => {
    try {
      await erpApi.recordStockMovement(moveData);
      toast('Material movement recorded successfully!');
      if (onSuccess) onSuccess();
      fetchModule2Data();
    } catch (err) {
      alert(`Error recording stock movement: ${err.message}`);
    }
  };

  return {
    state: {
      vendors,
      purchaseOrders,
      purchaseRequests,
      inventory,
      goodsReceipts,
      movements,
      selectedVendor,
      setSelectedVendor,
    },
    actions: {
      fetchModule2Data,
      handleSaveVendor,
      handleCreatePO,
      handleCreatePR,
      handleUpdatePOStatus,
      handleCreateGRN,
      handleRecordStockMovement,
    },
  };
}

export default useModule2;

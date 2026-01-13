import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/database';

export const useTransactions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTransaction = useCallback(async (
    buyerId: string,
    sellerId: string,
    productId: string,
    amount: number,
    paymentMethod: string = 'Mobile Money'
  ): Promise<Transaction | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('transactions')
        .insert({
          buyer_id: buyerId,
          seller_id: sellerId,
          product_id: productId,
          amount,
          status: 'pending',
          payment_method: paymentMethod,
          escrow_status: 'waiting',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (err) throw err;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmPayment = useCallback(async (transactionId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase
        .from('transactions')
        .update({
          status: 'paid',
          escrow_status: 'held',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      if (err) throw err;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmDelivery = useCallback(async (transactionId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          escrow_status: 'released',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      if (err) throw err;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelTransaction = useCallback(async (transactionId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase
        .from('transactions')
        .update({
          status: 'cancelled',
          escrow_status: 'refunded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      if (err) throw err;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const disputeTransaction = useCallback(async (transactionId: string, reason: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase
        .from('transactions')
        .update({
          status: 'disputed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      if (err) throw err;
      
      // Log the dispute for admin review
      console.log(`Dispute filed for transaction ${transactionId}: ${reason}`);
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createTransaction,
    confirmPayment,
    confirmDelivery,
    cancelTransaction,
    disputeTransaction,
  };
};

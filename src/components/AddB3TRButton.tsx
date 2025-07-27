import React from 'react';

export default function AddB3TRButton() {
  const addToken = async () => {
    try {
      const added = await window.vechain.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address:  '0x5ef79995fe8a89e0812330e4378eb2660cede699',
            symbol:   'B3TR',
            decimals: 18,
          },
        },
      });
      console.log('💰 B3TR added?', added);
    } catch (e) {
      console.error('❌ wallet_watchAsset failed', e);
    }
  };

  return (
    <button
      style={{
        padding: '0.5rem 1rem',
        fontSize: '1rem',
        borderRadius: '0.25rem',
        cursor: 'pointer',
      }}
      onClick={addToken}
    >
      ➕ Add B3TR to VeWorld
    </button>
  );
}

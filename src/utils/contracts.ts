export const NETWORK_ID = 100

export const Contracts = {
  bzz: '0xdBF3Ea6F5beE45c02255B2c26a16F300502F68da',
  postageStamp: '0x45a1502382541Cd610CC9068e88727426b696293',
}

export const ABI = {
  tokenProxy: [
    {
      type: 'function',
      stateMutability: 'nonpayable',
      payable: false,
      outputs: [{ type: 'bool', name: 'result' }],
      name: 'approve',
      inputs: [
        { type: 'address', name: '_to' },
        { type: 'uint256', name: '_value' },
      ],
      constant: false,
    },
  ],
  bzz: [
    {
      type: 'function',
      stateMutability: 'view',
      payable: false,
      outputs: [
        {
          type: 'uint256',
          name: '',
        },
      ],
      name: 'balanceOf',
      inputs: [
        {
          type: 'address',
          name: '_owner',
        },
      ],
      constant: true,
    },
    {
      type: 'function',
      stateMutability: 'nonpayable',
      payable: false,
      outputs: [
        {
          type: 'bool',
          name: '',
        },
      ],
      name: 'transfer',
      inputs: [
        {
          type: 'address',
          name: '_to',
        },
        {
          type: 'uint256',
          name: '_value',
        },
      ],
      constant: false,
    },
  ],
  postageStamp: [
    {
      inputs: [
        {
          internalType: 'address',
          name: '_owner',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: '_initialBalancePerChunk',
          type: 'uint256',
        },
        {
          internalType: 'uint8',
          name: '_depth',
          type: 'uint8',
        },
        {
          internalType: 'uint8',
          name: '_bucketDepth',
          type: 'uint8',
        },
        {
          internalType: 'bytes32',
          name: '_nonce',
          type: 'bytes32',
        },
        {
          internalType: 'bool',
          name: '_immutable',
          type: 'bool',
        },
      ],
      name: 'createBatch',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
}

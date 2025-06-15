import { blockchain, syncTransactionToBlockchain } from './blockchain';

describe('Blockchain', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset blockchain instance
    blockchain['chain'] = [blockchain['createGenesisBlock']()];
  });

  test('should create genesis block', () => {
    const chain = blockchain.getChain();
    expect(chain.length).toBe(1);
    expect(chain[0].index).toBe(0);
    expect(chain[0].previousHash).toBe('0'.repeat(64));
  });

  test('should add new block', () => {
    const testData = { id: 'test1', amount: 100 };
    const newBlock = blockchain.mineBlock(testData);
    
    expect(newBlock.index).toBe(1);
    expect(newBlock.data).toEqual(testData);
    expect(newBlock.previousHash).toBe(blockchain.getChain()[0].hash);
  });

  test('should validate chain', () => {
    const testData = { id: 'test2', amount: 200 };
    blockchain.mineBlock(testData);
    
    expect(blockchain.isChainValid()).toBe(true);
  });

  test('should sync transaction', async () => {
    const transaction = {
      id: 'tx1',
      amount: 150,
      timestamp: Date.now()
    };

    const result = await syncTransactionToBlockchain(transaction);
    expect(result).toBe(true);

    const chain = blockchain.getChain();
    const lastBlock = chain[chain.length - 1];
    expect(lastBlock.data).toEqual(transaction);
  });

  test('should prevent duplicate transactions', async () => {
    const transaction = {
      id: 'tx2',
      amount: 300,
      timestamp: Date.now()
    };

    // First sync should succeed
    const result1 = await syncTransactionToBlockchain(transaction);
    expect(result1).toBe(true);

    // Second sync of same transaction should fail
    const result2 = await syncTransactionToBlockchain(transaction);
    expect(result2).toBe(false);
  });

  test('should persist blockchain to localStorage', () => {
    const testData = { id: 'test3', amount: 400 };
    blockchain.mineBlock(testData);

    // Get the stored chain from localStorage
    const storedChain = localStorage.getItem('qr_secure_blockchain');
    expect(storedChain).not.toBeNull();
    
    if (storedChain) {
      const parsedChain = JSON.parse(storedChain);
      expect(parsedChain.length).toBe(2); // Genesis block + new block
      expect(parsedChain[1].data).toEqual(testData);
    }
  });
}); 
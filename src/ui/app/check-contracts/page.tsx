"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { readContract } from '@wagmi/core'
import { config } from '@/lib/web3/config'
import { CONTRACT_ADDRESSES } from '@/lib/web3/contracts/addresses'
import { PaymentManagerABI, CreationManagerABI, AuthorizationManagerABI } from '@/lib/web3/contracts/abis'

// Disable static generation for this test page
export const dynamic = 'force-dynamic'

export default function CheckContractsPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const checkContracts = async () => {
    setLoading(true)
    const checks: any = {}

    try {
      // 1. 检查 PaymentManager 的 creationManager
      console.log('Checking PaymentManager.creationManager...')
      const pmCreationManager = await readContract(config, {
        address: CONTRACT_ADDRESSES.payment,
        abi: PaymentManagerABI,
        functionName: 'creationManager',
        args: [],
      })
      checks.paymentManager_creationManager = pmCreationManager
      checks.paymentManager_creationManager_isSet = pmCreationManager !== '0x0000000000000000000000000000000000000000'

      // 2. 检查 PaymentManager 的 authorizationManager
      console.log('Checking PaymentManager.authorizationManager...')
      const pmAuthManager = await readContract(config, {
        address: CONTRACT_ADDRESSES.payment,
        abi: PaymentManagerABI,
        functionName: 'authorizationManager',
        args: [],
      })
      checks.paymentManager_authorizationManager = pmAuthManager
      checks.paymentManager_authorizationManager_isSet = pmAuthManager !== '0x0000000000000000000000000000000000000000'

      // 3. 检查 PaymentManager 的 platformWallet
      console.log('Checking PaymentManager.platformWallet...')
      const platformWallet = await readContract(config, {
        address: CONTRACT_ADDRESSES.payment,
        abi: PaymentManagerABI,
        functionName: 'platformWallet',
        args: [],
      })
      checks.paymentManager_platformWallet = platformWallet

      // 4. 检查 CreationManager 的 authorizationManager
      console.log('Checking CreationManager.authorizationManager...')
      const cmAuthManager = await readContract(config, {
        address: CONTRACT_ADDRESSES.creation,
        abi: CreationManagerABI,
        functionName: 'authorizationManager',
        args: [],
      })
      checks.creationManager_authorizationManager = cmAuthManager
      checks.creationManager_authorizationManager_isSet = cmAuthManager !== '0x0000000000000000000000000000000000000000'

      // 5. 检查 CreationManager 的 paymentManager
      console.log('Checking CreationManager.paymentManager...')
      const cmPaymentManager = await readContract(config, {
        address: CONTRACT_ADDRESSES.creation,
        abi: CreationManagerABI,
        functionName: 'paymentManager',
        args: [],
      })
      checks.creationManager_paymentManager = cmPaymentManager

      // 6. 检查 AuthorizationManager 的 creationManager
      console.log('Checking AuthorizationManager.creationManager...')
      const amCreationManager = await readContract(config, {
        address: CONTRACT_ADDRESSES.authorization,
        abi: AuthorizationManagerABI,
        functionName: 'creationManager',
        args: [],
      })
      checks.authorizationManager_creationManager = amCreationManager

      // 7. 检查 AuthorizationManager 的 paymentManager
      console.log('Checking AuthorizationManager.paymentManager...')
      const amPaymentManager = await readContract(config, {
        address: CONTRACT_ADDRESSES.authorization,
        abi: AuthorizationManagerABI,
        functionName: 'paymentManager',
        args: [],
      })
      checks.authorizationManager_paymentManager = amPaymentManager

      setResults(checks)
    } catch (error) {
      console.error('Error checking contracts:', error)
      checks.error = error instanceof Error ? error.message : 'Unknown error'
      setResults(checks)
    } finally {
      setLoading(false)
    }
  }

  const StatusBadge = ({ isOk }: { isOk: boolean }) => (
    <span className={`px-2 py-1 rounded text-xs font-bold ${isOk ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
      {isOk ? '✓ SET' : '✗ NOT SET'}
    </span>
  )

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Contract Configuration Check</h1>

      <div className="mb-8 p-4 bg-muted rounded-lg">
        <h2 className="font-bold mb-2">Contract Addresses</h2>
        <div className="space-y-1 text-sm font-mono">
          <div>PaymentManager: {CONTRACT_ADDRESSES.payment}</div>
          <div>CreationManager: {CONTRACT_ADDRESSES.creation}</div>
          <div>AuthorizationManager: {CONTRACT_ADDRESSES.authorization}</div>
        </div>
      </div>

      <Button onClick={checkContracts} disabled={loading} className="mb-8">
        {loading ? 'Checking...' : 'Check Contract Configuration'}
      </Button>

      {Object.keys(results).length > 0 && (
        <div className="space-y-6">
          {/* PaymentManager */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-bold text-lg mb-4">PaymentManager</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">creationManager</span>
                  {results.paymentManager_creationManager_isSet !== undefined && (
                    <StatusBadge isOk={results.paymentManager_creationManager_isSet} />
                  )}
                </div>
                <div className="text-xs font-mono text-muted-foreground break-all">
                  {results.paymentManager_creationManager || 'Not checked'}
                </div>
                {!results.paymentManager_creationManager_isSet && (
                  <div className="mt-2 p-2 bg-red-500/10 rounded text-xs text-red-500">
                    ⚠️ Call: paymentManager.setCreationManager({CONTRACT_ADDRESSES.creation})
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">authorizationManager</span>
                  {results.paymentManager_authorizationManager_isSet !== undefined && (
                    <StatusBadge isOk={results.paymentManager_authorizationManager_isSet} />
                  )}
                </div>
                <div className="text-xs font-mono text-muted-foreground break-all">
                  {results.paymentManager_authorizationManager || 'Not checked'}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">platformWallet</span>
                </div>
                <div className="text-xs font-mono text-muted-foreground break-all">
                  {results.paymentManager_platformWallet || 'Not checked'}
                </div>
              </div>
            </div>
          </div>

          {/* CreationManager */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-bold text-lg mb-4">CreationManager</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">authorizationManager</span>
                  {results.creationManager_authorizationManager_isSet !== undefined && (
                    <StatusBadge isOk={results.creationManager_authorizationManager_isSet} />
                  )}
                </div>
                <div className="text-xs font-mono text-muted-foreground break-all">
                  {results.creationManager_authorizationManager || 'Not checked'}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">paymentManager</span>
                </div>
                <div className="text-xs font-mono text-muted-foreground break-all">
                  {results.creationManager_paymentManager || 'Not checked'}
                </div>
              </div>
            </div>
          </div>

          {/* AuthorizationManager */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-bold text-lg mb-4">AuthorizationManager</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">creationManager</span>
                </div>
                <div className="text-xs font-mono text-muted-foreground break-all">
                  {results.authorizationManager_creationManager || 'Not checked'}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">paymentManager</span>
                </div>
                <div className="text-xs font-mono text-muted-foreground break-all">
                  {results.authorizationManager_paymentManager || 'Not checked'}
                </div>
              </div>
            </div>
          </div>

          {results.error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              <strong>Error:</strong> {results.error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

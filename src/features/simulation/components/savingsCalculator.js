/**
 * Calculates PV savings based on production, consumption, and storage.
 * @param {Object} params
 * @param {number} params.pvProduction - Annual PV production in kWh
 * @param {number} params.consumptionHousehold - Annual household consumption in kWh
 * @param {number} params.storageCapacity - Battery storage capacity in kWh
 * @param {number} params.electricityPrice - Electricity price in cents/kWh
 * @param {Function} params.setSelfConsumption - State setter for self consumption
 * @param {Function} params.setAnnualSavings - State setter for annual savings
 */
export async function calculateSavings({
  pvProduction,
  consumptionHousehold,
  storageCapacity,
  electricityPrice,
  setSelfConsumption,
  setAnnualSavings,
}) {
  const response = await fetch(
    'https://www.openpv.de/data/savings_calculation/cons_prod.json',
  )
  const data = await response.json()

  const normalizedConsumption = data['Consumption']
  const normalizedProduction = data['Production']

  const result = {}
  let currentStorageLevel = 0

  for (const timestamp in normalizedConsumption) {
    const consumptionValue =
      (normalizedConsumption[timestamp] * consumptionHousehold) / 1000
    const productionValue =
      (normalizedProduction[timestamp] * pvProduction) / 1000

    let selfConsumption = 0
    let excessProduction = 0

    if (productionValue > consumptionValue) {
      selfConsumption = consumptionValue
      excessProduction = productionValue - consumptionValue

      // Charge the storage
      const availableStorageSpace = storageCapacity - currentStorageLevel
      const chargedAmount = Math.min(excessProduction, availableStorageSpace)
      currentStorageLevel += chargedAmount
    } else {
      const productionDeficit = consumptionValue - productionValue

      // Use storage if available
      const usedFromStorage = Math.min(productionDeficit, currentStorageLevel)
      currentStorageLevel -= usedFromStorage

      selfConsumption = productionValue + usedFromStorage
    }

    result[timestamp] = selfConsumption
  }

  const selfConsumedElectricity = Object.values(result).reduce(
    (acc, val) => acc + val,
    0,
  )

  setSelfConsumption(Math.round(selfConsumedElectricity))
  setAnnualSavings(
    Math.round((selfConsumedElectricity * electricityPrice) / 100),
  )
}

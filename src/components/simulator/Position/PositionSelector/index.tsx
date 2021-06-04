import Checkbox from 'components/Checkbox'
import Input from 'components/Input'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { setPositionInvestedAmount, toggleInfiniteRange } from 'state/simulator/actions'
import { Position } from 'state/simulator/reducer'
import styled from 'styled-components'
import { AppDispatch } from '../../../../state'
import RangeSelector from './RangeSelector'
import RangeTypeSelect, { RangeTypes } from './RangeTypeSelect'
import { useAllSimulatorData } from 'state/simulator/hooks'
import AbsoluteSelector from './RangeSelector/AbsoluteSelector'
import RelativeSelector from './RangeSelector/RelativeSelector'
import { setPositionMinPrice, setPositionMaxPrice } from 'state/simulator/actions'
import { roundToNDecimals } from 'utils/numbers'
import { multiplyArraysElementWise } from 'utils/math'

const Wrapper = styled.div`
  color: ${({ theme }) => theme.text3};
`

const Headline = styled.div`
  display: flex;
  color: ${({ theme }) => theme.text3};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  margin-bottom: 30px;
  align-items: center;
`

const RangeInputsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const RangeTypeSelectWrapper = styled.div`
  margin-left: 10px;
`

const RangeSelectorWrapper = styled.div`
  height: 120px;
  display: flex;
  align-items: center;
`

const InfiniteRangeWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 6px;
  margin-top: 28px;
  color: ${({ theme }) => theme.text3};
  font-size: ${({ theme }) => theme.fontSize.small};
`

const InvestmentWrapper = styled.div`
  display: flex;
  align-items: center;
  padding-top: 20px;
  margin-top: 20px;
`

const InvestmentTitle = styled.div`
  margin-right: 20px;
`

const InvestmentInputWrapper = styled.div`
  width: 120px;
  margin-right: 10px;
`

const PriceLabel = styled.div`
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  margin: 4px 0;
`

const PriceLabelTitle = styled.div`
  width: 90px;
  display: flex;
`

interface Props {
  positionIndex: number
  investmentUsd: Position['investmentUsd']
  priceMin: Position['priceMin']
  priceMax: Position['priceMax']
  infiniteRangeSelected: Position['infiniteRangeSelected']
}

export default function PositionSelector({
  positionIndex,
  investmentUsd,
  infiniteRangeSelected,
  priceMin,
  priceMax,
}: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const [rangeSelectorType, setRangeSelectorType] = useState<RangeTypes>('absolute')
  const [investedAmountState, setInvestedAmountState] = useState(investmentUsd.toString())
  const {
    priceRatioOrder,
    tokenSymbols,
    currentTokenPricesUsd,
    simulatedPriceCoefficients,
    poolId,
  } = useAllSimulatorData()
  const currentPriceRatio = currentTokenPricesUsd[0] / currentTokenPricesUsd[1]

  // get simulated token price
  const simulatedTokenPricesUsd = multiplyArraysElementWise(currentTokenPricesUsd, simulatedPriceCoefficients)
  const simulatedPriceRatio = simulatedTokenPricesUsd[0] / simulatedTokenPricesUsd[1]

  const handleInvestmentChange = (inputValue: string) => {
    // change the value in the input
    setInvestedAmountState(inputValue)
    const inputValueFloat = parseFloat(inputValue)
    // if the input value is valid number, propagate the change to simulator reducer state
    if (inputValueFloat && inputValueFloat > 0) {
      dispatch(setPositionInvestedAmount({ value: inputValueFloat, positionIndex }))
    } else {
      dispatch(setPositionInvestedAmount({ value: 0, positionIndex }))
    }
  }

  const handlePriceLimitChange = (price: number, priceLimit: 'min' | 'max') => {
    if (priceLimit === 'min') dispatch(setPositionMinPrice({ price, positionIndex }))
    if (priceLimit === 'max') dispatch(setPositionMaxPrice({ price, positionIndex }))
  }

  const getPriceRangeSelector = (selectorType: RangeTypes, priceOrder: string, disabled: boolean) => {
    if (selectorType === 'relative') {
      if (priceOrder === 'default') {
        return (
          <RelativeSelector
            key={`${poolId}_RelativeSelector0`}
            disabled={disabled}
            positionIndex={positionIndex}
            onPriceLimitChange={(value, limit) => handlePriceLimitChange(value, limit)}
          />
        )
      } else {
        return (
          <RelativeSelector
            key={`${poolId}_RelativeSelector1`}
            disabled={disabled}
            positionIndex={positionIndex}
            onPriceLimitChange={(value, limit) => handlePriceLimitChange(value, limit)}
          />
        )
      }
    } else {
      if (priceOrder === 'default') {
        return (
          <AbsoluteSelector
            key={`${poolId}_AbsoluteSelector0`}
            disabled={disabled}
            positionIndex={positionIndex}
            onPriceLimitChange={(value, limit) => handlePriceLimitChange(value, limit)}
            priceMin={priceMin}
            priceMax={priceMax}
          />
        )
      } else {
        return (
          <AbsoluteSelector
            key={`${poolId}_AbsoluteSelector1`}
            disabled={disabled}
            positionIndex={positionIndex}
            onPriceLimitChange={(value, limit) => handlePriceLimitChange(value, limit)}
            priceMin={priceMin}
            priceMax={priceMax}
          />
        )
      }
    }
  }

  return (
    <Wrapper>
      <Headline>
        Specify price range:
        <RangeTypeSelectWrapper>
          <RangeTypeSelect
            typeSelected={rangeSelectorType}
            onTypeChange={(type) => {
              setRangeSelectorType(type)
            }}
          />
        </RangeTypeSelectWrapper>
      </Headline>
      <RangeInputsWrapper>
        {getPriceRangeSelector(rangeSelectorType, priceRatioOrder, infiniteRangeSelected)}
        {/* <RangeSelectorWrapper>
          <RangeSelector type={rangeSelectorType} positionIndex={positionIndex} disabled={infiniteRangeSelected} />
        </RangeSelectorWrapper> */}

        <PriceLabel>
          <PriceLabelTitle>Current:</PriceLabelTitle>
          {`1 ${tokenSymbols[0]} = ${roundToNDecimals(currentPriceRatio, 5)} ${tokenSymbols[1]} `}
        </PriceLabel>
        <PriceLabel>
          <PriceLabelTitle>Simulated:</PriceLabelTitle>
          {`1 ${tokenSymbols[0]} = ${roundToNDecimals(simulatedPriceRatio, 5)} ${tokenSymbols[1]} `}
        </PriceLabel>

        <InfiniteRangeWrapper>
          <Checkbox
            isChecked={infiniteRangeSelected}
            onClick={() => {
              dispatch(toggleInfiniteRange({ positionIndex }))
            }}
          >
            Infinite range (as Uniswap v2)
          </Checkbox>
        </InfiniteRangeWrapper>
      </RangeInputsWrapper>

      <InvestmentWrapper>
        <InvestmentTitle>Your investment in this position:</InvestmentTitle>
        <InvestmentInputWrapper>
          {/* TODO display in formatted fiat format */}
          <Input
            value={investedAmountState}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              handleInvestmentChange(event.target.value.trim())
            }}
            useWhiteBackground
            variant="small"
            type="number"
          />
        </InvestmentInputWrapper>
        USD
      </InvestmentWrapper>
    </Wrapper>
  )
}
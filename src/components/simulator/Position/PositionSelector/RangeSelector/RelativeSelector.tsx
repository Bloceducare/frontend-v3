import RangeSelector from 'components/RangeSelector'
import Input from 'components/Input'
import { useAllSimulatorData } from 'state/simulator/hooks'
import React, { useState } from 'react'
import styled from 'styled-components'
import { roundToNDecimals, toTwoNonZeroDecimals } from 'utils/numbers'

const Wrapper = styled.div`
  color: ${({ theme }) => theme.text2};
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
  // margin-bottom: 10px;
`

const InputWrapper = styled.div`
  width: 110px;
  margin: 0 12px;
  // padding-top: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const InputWrapper2 = styled.div`
  display: flex;
  align-items: center;
`

const PercentageLabel = styled.div`
  margin-left: 6px;
`

const AbsValueWrapper = styled.div`
  margin-top: 6px;
  padding-right: 16px;
  font-size: ${({ theme }) => theme.fontSize.small};
`

const InputLabel = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.text2};
  margin-bottom: 6px;
  padding-right: 16px;
  font-size: ${({ theme }) => theme.fontSize.small};
`

const SliderWrapper = styled.div`
  margin-left: 20px;
  margin-right: 20px;
`

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
  initialMinRatio?: number
  initialMaxRatio?: number
  positionIndex: number
  onPriceLimitChange: (value: number, limit: 'min' | 'max') => void
  disabled: boolean
  // priceMin: Position['priceMin'];
  // priceMax: Position['priceMax'];
  // infiniteRangeSelected: Position['infiniteRangeSelected'];
}

// eslint-disable-next-line no-empty-pattern
export default function RelativeRangeSelector({
  initialMinRatio = -50,
  initialMaxRatio = 50,
  onPriceLimitChange,
  disabled,
}: Props) {
  const { currentTokenPricesUsd } = useAllSimulatorData()
  const [sliderValues, setSliderValues] = useState([initialMinRatio, initialMaxRatio])

  const currentPriceRatio = currentTokenPricesUsd[0] / currentTokenPricesUsd[1]

  // TODO there is some bug. The input values do not change when I change the priceRatioOrder
  const [sliderMinPrice, setSliderMinPrice] = useState(initialMinRatio)
  const [sliderMaxPrice, setSliderMaxPrice] = useState(initialMaxRatio)
  const handleSliderLimitPriceChange = (value: string, price: 'min' | 'max') => {
    const typedValueFloat = parseFloat(value)
    if (price === 'min') {
      setSliderMinPrice(typedValueFloat)
      setSliderValues([typedValueFloat, sliderValues[1]])
    }
    if (price === 'max') {
      setSliderMaxPrice(typedValueFloat)
      setSliderValues([sliderValues[0], typedValueFloat])
    }
  }

  const getAbsolutePriceRatio = (currentPriceRatio: number, percentageDifference: number) =>
    toTwoNonZeroDecimals(currentPriceRatio + (percentageDifference / 100) * currentPriceRatio)

  const handleSliderMoveChange = (newValue: number[]) => {
    setSliderValues(newValue)
    // call function that saves changes to redux
    // newValue is percentage difference which the user selected. Compute price from that and save that value to redux.
    if (newValue[0]) {
      onPriceLimitChange(getAbsolutePriceRatio(currentPriceRatio, newValue[0]), 'min')
    }

    if (newValue[1]) {
      onPriceLimitChange(getAbsolutePriceRatio(currentPriceRatio, newValue[1]), 'max')
    }
  }

  // TODO if mark out of range, do not show
  const marks = [
    {
      value: 0,
      label: '',
    },
  ]

  return (
    <Wrapper>
      <InputWrapper>
        <InputLabel>Min</InputLabel>
        <InputWrapper2>
          <Input
            disabled={disabled}
            value={sliderValues[0].toString()}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              handleSliderLimitPriceChange(event.target.value.trim(), 'min')
            }}
            useWhiteBackground
            variant="small"
            type="number"
          />
          <PercentageLabel>%</PercentageLabel>
        </InputWrapper2>
        <AbsValueWrapper>
          {sliderValues[0] ? getAbsolutePriceRatio(currentPriceRatio, sliderValues[0]) : '-'}
        </AbsValueWrapper>
      </InputWrapper>

      <SliderWrapper>
        <RangeSelector
          disabled={disabled}
          min={sliderMinPrice}
          max={sliderMaxPrice}
          step={0.01}
          width={240}
          marks={marks}
          value={sliderValues}
          onChange={(_: any, newValue: number[]) => handleSliderMoveChange(newValue)}
        />
      </SliderWrapper>
      <InputWrapper>
        <InputLabel>Max</InputLabel>
        <InputWrapper2>
          <Input
            disabled={disabled}
            value={sliderValues[1].toString()}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              handleSliderLimitPriceChange(event.target.value.trim(), 'max')
            }}
            useWhiteBackground
            variant="small"
            type="number"
          />
          <PercentageLabel>%</PercentageLabel>
        </InputWrapper2>
        <AbsValueWrapper>
          {sliderValues[1] ? getAbsolutePriceRatio(currentPriceRatio, sliderValues[1]) : '-'}
        </AbsValueWrapper>
      </InputWrapper>
    </Wrapper>
  )
}
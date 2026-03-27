import { useColorModeValue } from '@/components/ui/color-mode'
import { processAddress } from '@/features/simulation/core/location'
import {
  Button,
  IconButton,
  Input,
  InputGroup,
  List,
  Spinner,
} from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuSearch, LuX } from 'react-icons/lu'

export default function SearchField({ callback }) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsVisible, setSuggestionsVisible] = useState(false)
  // isSelectedAddress is used so that if an adress is already selected,
  // the autocomplete does stop to run
  const [isSelectedAddress, setIsSelectedAddress] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [needsHouseNumber, setNeedsHouseNumber] = useState(false)
  const suggestionsRef = useRef([])
  const inputRef = useRef()
  const formRef = useRef()
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const { t } = useTranslation()
  const inputBg = useColorModeValue('white', 'gray.700')
  const listBg = useColorModeValue('white', 'gray.800')
  const listItemHoverBg = useColorModeValue('gray.100', 'gray.700')
  const listItemFocusedBg = useColorModeValue('gray.100', 'gray.700')
  const listItemColor = useColorModeValue('black', 'white')

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setSuggestionsVisible(false)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.length < 3) {
        // If the input is deleted or replaced with one
        // charakter, the autocomplete should start again
        setIsSelectedAddress(false)
      }
      if (isSelectedAddress) {
        return
      }
      if (inputValue.length > 2) {
        setIsFetching(true)
        try {
          const inputValueParts = inputValue.split(' ')
          let streetAddressNumber = null

          // Find the street address number
          for (let inputPart of inputValueParts) {
            if (inputPart[inputPart.length - 1] === ',') {
              //drop last character (ie the comma)
              inputPart = inputPart.slice(0, -1)
            }
            if (inputPart.length === 5) {
              // continue if it has the length of a zip code
              continue
            }
            if (/^\d{1,3}[a-zA-Z]?$/.test(inputPart)) {
              // regex chatches numbers with 1-3 digits plus one charater
              streetAddressNumber = inputPart
              break
            }
          }

          const response = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(
              inputValue,
            )}&bbox=5.98865807458,47.3024876979,15.0169958839,54.983104153&limit=5&lang=de&layer=street`,
          )
          const data = await response.json()

          const fetchedSuggestions = data.features.map((feature) => {
            const streetName = feature.properties.name
            const postcode = feature.properties.postcode
            const city = feature.properties.city
            let display = streetName
            if (streetAddressNumber) {
              display += ' ' + streetAddressNumber
            }
            display += ', ' + postcode + ' ' + city
            return {
              display,
              streetName,
              postcode,
              city,
              houseNumber: streetAddressNumber,
            }
          })
          setSuggestions(fetchedSuggestions)
          setSuggestionsVisible(true)
        } catch (error) {
          console.error('Error fetching suggestions:', error)
        } finally {
          setIsFetching(false)
        }
      } else {
        setSuggestions([])
        setSuggestionsVisible(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 200)
    return () => clearTimeout(debounceTimer)
  }, [inputValue, isSelectedAddress])

  const submitAddress = async (address) => {
    setIsSubmitting(true)
    setSubmitError(false)
    try {
      const locations = await processAddress(address)
      if (locations.length === 0) {
        setSubmitError(true)
      } else {
        callback(locations)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    submitAddress(inputValue)
  }

  const handleSuggestionClick = (suggestion) => {
    const { streetName, postcode, city, houseNumber } = suggestion
    if (houseNumber) {
      // House number already known — fill completely and submit
      const fullAddress = `${streetName} ${houseNumber}, ${postcode} ${city}`
      setInputValue(fullAddress)
      setSuggestions([])
      setSuggestionsVisible(false)
      setIsSelectedAddress(true)
      setNeedsHouseNumber(false)
      submitAddress(fullAddress)
    } else {
      // No house number yet — ask user to type it
      const newValue = `${streetName} , ${postcode} ${city}`
      const cursorPos = streetName.length + 1
      setInputValue(newValue)
      setSuggestions([])
      setSuggestionsVisible(false)
      setIsSelectedAddress(true)
      setNeedsHouseNumber(true)
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.setSelectionRange(cursorPos, cursorPos)
      }, 0)
    }
  }

  const handleClear = () => {
    setInputValue('')
    setSuggestions([])
    setSuggestionsVisible(false)
    setIsSelectedAddress(false)
    setNeedsHouseNumber(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setFocusedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex,
      )
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setFocusedIndex((prevIndex) => (prevIndex > -1 ? prevIndex - 1 : -1))
    } else if (event.key === 'Enter' && focusedIndex > -1) {
      event.preventDefault()
      handleSuggestionClick(suggestions[focusedIndex])
    }
  }

  useEffect(() => {
    if (focusedIndex > -1 && suggestionsRef.current[focusedIndex]) {
      suggestionsRef.current[focusedIndex].focus()
    } else if (focusedIndex === -1) {
      inputRef.current.focus()
    }
  }, [focusedIndex])

  const startElement = isFetching ? <Spinner size='xs' /> : <LuSearch />

  const endElement =
    inputValue.length > 0 && !isSubmitting ? (
      <IconButton
        variant='ghost'
        size='xs'
        aria-label={t('searchField.clear')}
        onClick={handleClear}
      >
        <LuX />
      </IconButton>
    ) : null

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '5px',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <InputGroup
          startElement={startElement}
          endElement={endElement}
          flex='1'
          margin={'5px'}
        >
          <Input
            ref={inputRef}
            value={inputValue}
            bg={inputBg}
            placeholder={t('searchField.placeholder')}
            onChange={(evt) => {
              setInputValue(evt.target.value)
              setSubmitError(false)
              setNeedsHouseNumber(false)
            }}
            onKeyDown={handleKeyDown}
            autoComplete='off'
            disabled={isSubmitting}
            role='combobox'
            aria-expanded={suggestionsVisible}
            aria-autocomplete='list'
            aria-haspopup='listbox'
          />
        </InputGroup>
        <Button
          margin={'5px'}
          minWidth={'150px'}
          type='submit'
          variant='subtle'
          loading={isSubmitting}
        >
          {t('Search')}
        </Button>
      </div>
      {needsHouseNumber && (
        <div
          style={{ color: '#b45309', fontSize: '0.875em', padding: '4px 10px' }}
        >
          {t('searchField.enterHouseNumber')}
        </div>
      )}
      {submitError && (
        <div style={{ color: 'red', fontSize: '0.875em', padding: '4px 10px' }}>
          {t('noSearchResults.description')}
        </div>
      )}
      {suggestionsVisible && (
        <List.Root
          as='ul'
          role='listbox'
          style={{ paddingLeft: '0', marginTop: '0' }}
          variant='plain'
          borderWidth={1}
          mt={2}
          position='absolute'
          top='100%'
          left={0}
          right={0}
          zIndex={1}
          boxShadow='md'
          backgroundColor={listBg}
        >
          {suggestions.length === 0 ? (
            <List.Item p={2} style={{ paddingLeft: '1em' }} color={'gray.500'}>
              {t('searchField.noResults')}
            </List.Item>
          ) : (
            suggestions.map((suggestion, index) => (
              <List.Item
                ref={(elem) => (suggestionsRef.current[index] = elem)}
                key={index}
                p={2}
                style={{ paddingLeft: '1em' }}
                cursor='pointer'
                _hover={{ backgroundColor: listItemHoverBg }}
                backgroundColor={
                  focusedIndex === index ? listItemFocusedBg : listBg
                }
                onClick={() => handleSuggestionClick(suggestion)}
                onKeyDown={handleKeyDown}
                color={listItemColor}
                tabIndex={0}
                role='option'
                aria-selected={focusedIndex === index}
              >
                {suggestion.display}
              </List.Item>
            ))
          )}
        </List.Root>
      )}
    </form>
  )
}

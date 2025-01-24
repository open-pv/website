import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import { Box, Button, Circle, Flex, Image } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

function WelcomeMessageBoxElement({ image, text }) {
  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='space-between'
    >
      {image && (
        <Image
          src={image.src}
          alt={image.alt}
          style={{ maxHeight: '200px', width: 'auto', margin: '20px' }}
        />
      )}

      {text}
    </Box>
  )
}

function WelcomeMessage() {
  const [currentPage, setCurrentPage] = useState(1)
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)

  const numPages = 5

  const nextPage = () => {
    if (currentPage < numPages) setCurrentPage(currentPage + 1)
  }

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  return (
    <DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('WelcomeMessage.title')}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          {currentPage === 1 && (
            <WelcomeMessageBoxElement
              image={{
                src: 'images/WelcomeMessage1.png',
                alt: 'Screenshot from the Search Input, where some address is written down.',
              }}
              text={t('WelcomeMessage.firstPage')}
            />
          )}
          {currentPage === 2 && (
            <WelcomeMessageBoxElement
              image={{
                src: 'images/WelcomeMessage2.png',
                alt: 'Screenshot from a possible Simulation Result, where the solar potential of a 3D building is shown.',
              }}
              text={t('WelcomeMessage.secondPage')}
            />
          )}
          {currentPage === 3 && (
            <WelcomeMessageBoxElement
              image={{
                src: 'images/WelcomeMessage3.png',
                alt: 'Screenshot from a possible Simulation Result, where a PV system was created and the annual result was calculated.',
              }}
              text={t('WelcomeMessage.thirdPage')}
            />
          )}
          {currentPage === 4 && (
            <WelcomeMessageBoxElement
              image={{
                src: 'images/WelcomeMessage4.png',
                alt: 'Screenshot from a possible Simulation Result, where a PV system was created and the annual result was calculated.',
              }}
              text={t('WelcomeMessage.fourthPage')}
            />
          )}
          {currentPage === 5 && (
            <WelcomeMessageBoxElement text={t('WelcomeMessage.fifthPage')} />
          )}
        </DialogBody>

        <DialogFooter>
          <Button
            variant='subtle'
            mr={3}
            onClick={prevPage}
            isDisabled={currentPage === 1}
          >
            {t('previous')}
          </Button>
          {currentPage != 5 && (
            <Button
              variant='subtle'
              mr={3}
              onClick={nextPage}
              isDisabled={currentPage === numPages}
            >
              {t('next')}
            </Button>
          )}
        </DialogFooter>
        <Flex justifyContent='center' mb={4}>
          {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
            <Circle
              key={page}
              size='10px'
              bg={currentPage === page ? 'blue.500' : 'gray.300'}
              m={1}
            />
          ))}
        </Flex>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default WelcomeMessage

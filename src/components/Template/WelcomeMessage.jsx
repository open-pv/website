import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from '@/components/ui/accordion'
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import { Box, Image } from '@chakra-ui/react'
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
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)

  return (
    <DialogRoot size='xl' open={open} onOpenChange={(e) => setOpen(e.open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('WelcomeMessage.title')}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <p>{t(`WelcomeMessage.introduction`)}</p>
          <br />
          {Array.from({ length: 5 }, (_, index) => (
            <AccordionRoot multiple>
              <AccordionItem key={index}>
                <AccordionItemTrigger>
                  {t(`WelcomeMessage.${index}.title`)}
                </AccordionItemTrigger>
                <AccordionItemContent>
                  <WelcomeMessageBoxElement
                    image={{
                      src: `images/WelcomeMessage${index}.png`,
                      alt: t(`WelcomeMessage.${index}.alt`),
                    }}
                    text={t(`WelcomeMessage.${index}.text`)}
                  />
                </AccordionItemContent>
              </AccordionItem>
            </AccordionRoot>
          ))}
        </DialogBody>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default WelcomeMessage

import { describe, it, expect } from 'vitest'
import { authorizationSchema } from '../authorization.validations'

describe('authorizationSchema', () => {
  const validData = {
    familyMemberId: 'member-1',
    documentType: 'Carta de Autorizacion',
  }

  it('should pass with minimum required fields', () => {
    const result = authorizationSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should pass with all sections filled', () => {
    const result = authorizationSchema.safeParse({
      ...validData,
      epsProviderId: 'eps-1',
      requestNumber: 'AUTH-001',
      issuingDate: '2026-04-01',
      expirationDate: '2026-04-20',
      priority: 'urgente',
      notes: 'Requiere seguimiento',
      diagnosisCode: 'A09',
      diagnosisDescription: 'Diagnostico de prueba',
      patientLocation: 'Medellin',
      serviceOrigin: 'Urgencias',
      providerName: 'Clinica Central',
      providerNit: '900123456',
      providerCode: 'IPS001',
      providerAddress: 'Calle 10 # 20-30',
      providerPhone: '6041234567',
      providerDepartment: 'Antioquia',
      providerCity: 'Medellin',
      paymentType: 'Copago',
      copayValue: 25000,
      copayPercentage: 10,
      maxValue: 100000,
      weeksContributed: 24,
      services: [
        {
          serviceCode: '890201',
          serviceName: 'Consulta especializada',
          quantity: 1,
          serviceType: 'consulta',
        },
        {
          serviceCode: '902210',
          serviceName: 'Radiografia',
          quantity: 2,
        },
      ],
    })

    expect(result.success).toBe(true)
  })

  it('should fail with empty familyMemberId', () => {
    const result = authorizationSchema.safeParse({
      ...validData,
      familyMemberId: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('El miembro de familia es obligatorio')
    }
  })

  it('should fail with empty documentType', () => {
    const result = authorizationSchema.safeParse({
      ...validData,
      documentType: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('El tipo de documento es obligatorio')
    }
  })

  it('should fail with invalid priority', () => {
    const result = authorizationSchema.safeParse({
      ...validData,
      priority: 'critica',
    })

    expect(result.success).toBe(false)
  })

  it('should fail when a service has empty code', () => {
    const result = authorizationSchema.safeParse({
      ...validData,
      services: [
        {
          serviceCode: '',
          serviceName: 'Consulta especializada',
          quantity: 1,
        },
      ],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('El código del servicio es obligatorio')
    }
  })

  it('should fail when a service has empty name', () => {
    const result = authorizationSchema.safeParse({
      ...validData,
      services: [
        {
          serviceCode: '890201',
          serviceName: '',
          quantity: 1,
        },
      ],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('El nombre del servicio es obligatorio')
    }
  })

  it('should fail when a service quantity is lower than one', () => {
    const result = authorizationSchema.safeParse({
      ...validData,
      services: [
        {
          serviceCode: '890201',
          serviceName: 'Consulta especializada',
          quantity: 0,
        },
      ],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('La cantidad debe ser al menos 1')
    }
  })

  it('should accept empty optional fields', () => {
    const result = authorizationSchema.safeParse({
      ...validData,
      epsProviderId: '',
      requestNumber: '',
      notes: '',
      diagnosisCode: '',
      providerName: '',
      paymentType: '',
      services: [],
    })

    expect(result.success).toBe(true)
  })
})

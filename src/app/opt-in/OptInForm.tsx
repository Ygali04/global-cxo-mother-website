"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import HeaderFive from "@/layouts/headers/HeaderFive"
import FooterThree from "@/layouts/footers/FooterThree"
import { Check, Mail, User, ShieldAlert, CheckCircle2, ChevronRight } from "lucide-react"
import { toast } from "react-toastify"

// =========================================================================
// GOOGLE SHEETS CONFIGURATION
// Form data is routed to /api/opt-in server-side, which forwards it to
// a Google Apps Script Web App connected directly to your Google Sheet.
// Configure the endpoint URL using the OPT_IN_SCRIPT_URL env variable.
// =========================================================================

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const Required = () => <span style={{ color: "#DC2626" }}> *</span>

export default function OptInForm() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [consent, setConsent] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string
    lastName?: string
    email?: string
    consent?: string
  }>({})

  useEffect(() => {
    // Check if there was an error during a previous submit that triggered a reload
    const storedError = sessionStorage.getItem("opt_in_error")
    if (storedError) {
      setSubmitError(storedError)
      sessionStorage.removeItem("opt_in_error")
      toast.error(storedError)
    }
  }, [])

  const validate = () => {
    const errors: typeof fieldErrors = {}
    if (!firstName.trim()) {
      errors.firstName = "Please enter your first name."
    }
    if (!lastName.trim()) {
      errors.lastName = "Please enter your last name."
    }
    if (!email.trim()) {
      errors.email = "Please enter your email address."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      errors.email = "Please enter a valid email address (e.g. name@company.com)."
    }
    if (!consent) {
      errors.consent = "You must consent to receive communications to proceed."
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/opt-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSubmitted(true)
        toast.success("Response recorded")
      } else {
        // Reload the form when there is an error while submitting and say there was an error please try again
        sessionStorage.setItem("opt_in_error", "There was an error. Please try again.")
        window.location.reload()
      }
    } catch (err) {
      console.error(err)
      // Reload the form when there is an error while submitting and say there was an error please try again
      sessionStorage.setItem("opt_in_error", "There was an error. Please try again.")
      window.location.reload()
    } finally {
      setSubmitting(false)
    }
  }

  const clearError = (key: keyof typeof fieldErrors) => {
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
    }
    setSubmitError(null)
  }

  return (
    <div className="overflow-x-hidden" style={{ background: "#f8f9fa" }}>
      {/* Scoped Responsive CSS */}
      <style>{`
        .opt-in-card {
          background: #ffffff;
          border-radius: 14px;
          padding: 20px 15px;
          box-shadow: 0 10px 30px rgba(11,26,74,0.04), 0 1px 3px rgba(0,0,0,0.02);
          border-width: 1px;
          border-style: solid;
          border-color: var(--tg-border-1);
        }
        .opt-in-input-container {
          width: 100%;
          margin-bottom: 12px;
        }
        .opt-in-input-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }
        .opt-in-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          width: 14px;
          height: 14px;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          z-index: 10;
        }
        .opt-in-input {
          width: 100%;
          padding: 8.5px 12px 8.5px 33px;
          border-radius: 7px;
          border-width: 1px;
          border-style: solid;
          border-color: var(--tg-border-1);
          background: #fff;
          font-size: 13px;
          color: var(--tg-heading-color);
          box-shadow: 0 2px 6px rgba(11,26,74,0.02);
          transition: all 0.25s ease;
          outline: none;
        }
        .opt-in-input::placeholder {
          color: #c4c4c4;
          opacity: 1;
          font-weight: 400;
        }
        .opt-in-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.10);
        }
        .opt-in-input.error {
          border-color: #DC2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.08);
        }
        .opt-in-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--tg-heading-color);
          margin-bottom: 3px;
          text-align: left;
        }
        .opt-in-error-text {
          margin-top: 4px;
          font-size: 11.5px;
          color: #DC2626;
          text-align: left;
        }
        .opt-in-checkbox-label {
          display: flex;
          align-items: flex-start;
          cursor: pointer;
          user-select: none;
          font-size: 11.5px;
          color: var(--tg-body-color);
          line-height: 1.35;
          text-align: left;
        }
        .opt-in-submit-btn {
          width: 100%;
          padding: 9.5px 14px;
          border-radius: 7px;
          border-width: 0;
          background: var(--tg-color-gradient);
          color: #fff;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(11,26,74,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          margin-top: 14px;
        }
        .opt-in-submit-btn:disabled {
          cursor: not-allowed;
          opacity: 0.85;
        }

        @media (min-width: 576px) {
          .opt-in-card {
            border-radius: 20px;
            padding: 32px 26px;
          }
          .opt-in-input-container {
            margin-bottom: 18px;
          }
          .opt-in-icon {
            left: 15px;
            width: 17px;
            height: 17px;
          }
          .opt-in-input {
            padding: 12px 16px 12px 42px;
            border-radius: 10px;
            font-size: 14.5px;
          }
          .opt-in-label {
            font-size: 13px;
            margin-bottom: 6px;
          }
          .opt-in-error-text {
            font-size: 12px;
          }
          .opt-in-checkbox-label {
            font-size: 13.5px;
            line-height: 1.5;
          }
          .opt-in-submit-btn {
            padding: 12.5px 16px;
            border-radius: 10px;
            font-size: 15px;
            margin-top: 22px;
          }
        }
      `}</style>

      <HeaderFive hideSignIn />

      {/* Hero Banner Section */}
      <section className="pt-[110px] pb-12 sm:pt-[150px] sm:pb-16 relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full blur-3xl opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(10,60,194,0.14) 0%, rgba(179,0,185,0.08) 55%, transparent 80%)",
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <FadeUp>
                <span
                  style={{
                    background: "var(--tg-color-gradient)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    fontSize: "11.5px",
                    marginBottom: "6px",
                    display: "inline-block",
                  }}
                >
                  Stay Connected
                </span>
              </FadeUp>

              <FadeUp delay={0.1}>
                <h1
                  style={{
                    fontSize: "clamp(24px, 4vw, 36px)",
                    fontWeight: 800,
                    lineHeight: 1.2,
                    color: "var(--tg-heading-color)",
                    marginBottom: "10px",
                  }}
                >
                  Receive future updates
                </h1>
              </FadeUp>

              <FadeUp delay={0.2}>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--tg-body-color)",
                    lineHeight: 1.55,
                    maxWidth: "540px",
                    margin: "0 auto",
                  }}
                >
                  Opt-in to receive emails, future invitations to exclusive events, 
                  and technology insights from Global CXO Circle.
                </p>
              </FadeUp>
            </div>
          </div>

          {/* Form Container */}
          <div className="row justify-content-center" style={{ marginTop: "24px" }}>
            <div className="col-lg-6 col-md-8 col-sm-10">
              <FadeUp delay={0.3}>
                <div className="opt-in-card">
                  <AnimatePresence mode="wait">
                    {!submitted ? (
                      <motion.form
                        key="form"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        onSubmit={handleSubmit}
                        noValidate
                        autoComplete="on"
                      >
                        {/* First Name Field */}
                        <div style={{ textAlign: "left" }}>
                          <label htmlFor="firstName" className="opt-in-label">
                            First Name<Required />
                          </label>
                          <div className="opt-in-input-container">
                            <div className="opt-in-input-wrapper">
                              <User className="opt-in-icon" />
                              <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                autoComplete="given-name"
                                value={firstName}
                                onChange={(e) => {
                                  setFirstName(e.target.value)
                                  clearError("firstName")
                                }}
                                className={`opt-in-input ${fieldErrors.firstName ? "error" : ""}`}
                                placeholder="John"
                                required
                              />
                            </div>
                            {fieldErrors.firstName && (
                              <p className="opt-in-error-text">{fieldErrors.firstName}</p>
                            )}
                          </div>
                        </div>

                        {/* Last Name Field */}
                        <div style={{ textAlign: "left" }}>
                          <label htmlFor="lastName" className="opt-in-label">
                            Last Name<Required />
                          </label>
                          <div className="opt-in-input-container">
                            <div className="opt-in-input-wrapper">
                              <User className="opt-in-icon" />
                              <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                autoComplete="family-name"
                                value={lastName}
                                onChange={(e) => {
                                  setLastName(e.target.value)
                                  clearError("lastName")
                                }}
                                className={`opt-in-input ${fieldErrors.lastName ? "error" : ""}`}
                                placeholder="Doe"
                                required
                              />
                            </div>
                            {fieldErrors.lastName && (
                              <p className="opt-in-error-text">{fieldErrors.lastName}</p>
                            )}
                          </div>
                        </div>

                        {/* Email Field */}
                        <div style={{ textAlign: "left" }}>
                          <label htmlFor="email" className="opt-in-label">
                            Email Address<Required />
                          </label>
                          <div className="opt-in-input-container">
                            <div className="opt-in-input-wrapper">
                              <Mail className="opt-in-icon" />
                              <input
                                type="email"
                                id="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => {
                                  setEmail(e.target.value)
                                  clearError("email")
                                }}
                                className={`opt-in-input ${fieldErrors.email ? "error" : ""}`}
                                placeholder="john.doe@company.com"
                                required
                              />
                            </div>
                            {fieldErrors.email && (
                              <p className="opt-in-error-text">{fieldErrors.email}</p>
                            )}
                          </div>
                        </div>

                        {/* Consent Checkbox */}
                        <div style={{ margin: "16px 0 12px", textAlign: "left" }}>
                          <label className="opt-in-checkbox-label">
                            <input
                              type="checkbox"
                              checked={consent}
                              onChange={(e) => {
                                setConsent(e.target.checked)
                                clearError("consent")
                              }}
                              style={{ display: "none" }}
                            />
                            <span
                              style={{
                                flexShrink: 0,
                                width: "17px",
                                height: "17px",
                                borderRadius: "5px",
                                borderWidth: consent ? "0px" : "1.5px",
                                borderStyle: consent ? "none" : "solid",
                                borderColor: fieldErrors.consent
                                  ? "#DC2626"
                                  : consent
                                  ? "transparent"
                                  : "var(--tg-border-1)",
                                background: consent ? "var(--tg-color-gradient)" : "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: "9px",
                                marginTop: "1px",
                                transition: "all 0.2s ease",
                                boxSizing: "border-box",
                              }}
                              className="sm:!w-[20px] sm:!h-[20px] sm:!rounded-[6px] sm:!mr-[12px]"
                            >
                              {consent && <Check style={{ color: "#fff", width: "13px", height: "13px" }} className="sm:!w-[14px] sm:!h-[14px]" />}
                            </span>
                            <span>
                              I consent to receive emails, event updates, newsletters, and promotional updates from Global CXO Circle.<Required />
                            </span>
                          </label>
                          {fieldErrors.consent && (
                            <p className="opt-in-error-text" style={{ marginLeft: "26px", marginTop: "6px" }}>
                              {fieldErrors.consent}
                            </p>
                          )}
                        </div>

                        {/* Submit Error Banner */}
                        {submitError && (
                          <div
                            style={{
                              background: "#FEF2F2",
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "#FCA5A5",
                              borderRadius: "8px",
                              padding: "10px 14px",
                              color: "#B91C1C",
                              fontSize: "13px",
                              marginTop: "14px",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              textAlign: "left"
                            }}
                          >
                            <ShieldAlert style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                            <span>{submitError}</span>
                          </div>
                        )}

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={submitting}
                          className="opt-in-submit-btn hover-gradient"
                        >
                          {submitting ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                                style={{ width: "15px", height: "15px", borderWidth: "2px" }}
                              ></span>
                              Submitting...
                            </>
                          ) : (
                            <>
                              Submit
                              <ChevronRight style={{ width: "15px", height: "15px" }} />
                            </>
                          )}
                        </button>
                      </motion.form>
                    ) : (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{ textAlign: "center", padding: "16px 6px" }}
                      >
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            background: "rgba(16,185,129,0.1)",
                            color: "#10b981",
                            marginBottom: "16px",
                          }}
                        >
                          <CheckCircle2 style={{ width: "32px", height: "32px" }} />
                        </div>
                        <h3
                          style={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "var(--tg-heading-color)",
                            marginBottom: "10px",
                          }}
                        >
                          Response recorded
                        </h3>
                        <p
                          style={{
                            fontSize: "14px",
                            color: "var(--tg-body-color)",
                            lineHeight: "1.55",
                            marginBottom: "20px",
                          }}
                        >
                          Thank you for choosing to stay connected. Your response has been recorded.
                        </p>
                        <button
                          onClick={() => {
                            setFirstName("")
                            setLastName("")
                            setEmail("")
                            setConsent(false)
                            setSubmitted(false)
                            setSubmitError(null)
                          }}
                          style={{
                            background: "transparent",
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: "var(--tg-border-1)",
                            padding: "8px 18px",
                            borderRadius: "7px",
                            fontSize: "13.5px",
                            color: "var(--tg-body-color)",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          className="btn-outline-hover"
                        >
                          Submit another response
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      <FooterThree />
    </div>
  )
}

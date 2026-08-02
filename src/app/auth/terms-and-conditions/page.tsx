"use client";
import React from "react";

import { Box, Paper, Typography } from "@mui/material";

import Logo from "@/components/logo/logo";

export default function Page() {
  return (
    <Box className="bg-waves flex min-h-screen w-full items-center justify-center bg-cover bg-fixed bg-center p-4">
      <Paper elevation={3} className="bg-background-paper shadow-darker-xs w-240 max-w-full rounded-4xl py-14">
        <Box className="flex flex-col gap-4 px-8 sm:px-14">
          <Box className="flex flex-col">
            <Box className="mb-14 flex justify-start">
              <Logo classNameMobile="hidden" />
            </Box>

            <Box className="flex flex-col gap-10">
              <Box className="flex flex-col">
                <Typography variant="h1" component="h1" className="mb-2">
                  Terms and Conditions
                </Typography>
                <Typography variant="body1" className="text-text-primary">
                  Welcome to AquaVista. These Terms and Conditions govern your access to and use of the AquaVista
                  platform and services. By creating an account or using AquaVista, you agree to be bound by these
                  terms. If you do not agree, please do not use the platform.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" className="mb-2">
                  1. Acceptance of Terms
                </Typography>
                <Typography variant="body1">
                  These Terms constitute a binding agreement between you and AquaVista. You must be at least 16 years
                  old or the age of legal majority in your jurisdiction to use the service. By registering, you
                  represent that you have the authority to agree on behalf of yourself or the organization you
                  represent.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  2. About the Service
                </Typography>
                <Typography variant="body1">
                  AquaVista is a collaborative platform designed for water and wastewater utilities, municipalities,
                  consultants, and related organizations to manage rate-study projects, upload and analyze data, and
                  leverage AI-powered assistance through AVA. The platform is provided on a software-as-a-service basis
                  and is intended to support, not replace, professional engineering, financial, and legal analysis.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  3. Account Registration and Security
                </Typography>
                <Typography variant="body1">
                  You agree to provide accurate and complete information when creating an account and to keep your login
                  credentials secure. You are responsible for all activity that occurs under your account. Notify us
                  immediately if you suspect unauthorized access. AquaVista accounts are intended for authorized
                  personnel of the registering organization.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  4. Acceptable Use
                </Typography>
                <Typography variant="body1">
                  You may use AquaVista only for lawful purposes and in accordance with these Terms. You agree not to:
                </Typography>
                <ul className="list-inside list-disc [&>li]:ms-2 [&>li:first-of-type]:mt-1">
                  <li>Use the platform for any unlawful, fraudulent, or harmful purpose</li>
                  <li>Attempt to gain unauthorized access to the platform or other users&apos; accounts</li>
                  <li>Upload malicious code, viruses, or harmful content</li>
                  <li>Reverse engineer, decompile, or tamper with the service</li>
                  <li>Share credentials or allow unauthorized users to access your account</li>
                  <li>Upload data that infringes on the rights of any third party</li>
                  <li>Use the platform in a way that could impair its security, stability, or availability</li>
                </ul>
                <br />

                <Typography variant="h6" className="mb-2">
                  5. Your Content and Data
                </Typography>
                <Typography variant="body1">
                  You retain ownership of the data, documents, and other content you upload to AquaVista. By uploading
                  content, you grant AquaVista a limited license to host, process, and display that content solely to
                  provide the service to you and your authorized project collaborators. You are responsible for ensuring
                  that your data is accurate, lawful, and does not violate any third-party rights. AquaVista does not
                  claim ownership over your proprietary rate-study data.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  6. AI Assistance and AVA
                </Typography>
                <Typography variant="body1">
                  AVA is an AI assistant designed to help interpret uploaded data and generate insights for your
                  projects. Outputs from AVA are generated by artificial intelligence and should be reviewed by
                  qualified professionals before being used for official decisions. AquaVista does not guarantee that
                  AI-generated outputs are complete, accurate, or suitable for your specific circumstances. You should
                  not rely on AVA outputs as a substitute for professional engineering, financial, or legal advice.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  7. Intellectual Property
                </Typography>
                <Typography variant="body1">
                  AquaVista and its licensors own all intellectual property rights in the platform, including the
                  software, designs, logos, documentation, and AI model integrations, except for the content you upload.
                  These rights are protected by copyright, trademark, and other laws. No transfer of ownership is
                  granted by these Terms.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  8. Confidentiality
                </Typography>
                <Typography variant="body1">
                  You agree to maintain the confidentiality of proprietary project data and not disclose such
                  information to unauthorized third parties. AquaVista will use reasonable measures to safeguard your
                  data in accordance with our Privacy Policy and applicable laws.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  9. Disclaimers
                </Typography>
                <Typography variant="body1">
                  The platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any
                  kind, either express or implied. AquaVista does not warrant that the service will be uninterrupted,
                  error-free, or that defects will be corrected. The use of AquaVista and any reliance on its outputs is
                  at your own risk.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  10. Limitation of Liability
                </Typography>
                <Typography variant="body1">
                  To the fullest extent permitted by law, AquaVista and its officers, employees, agents, and affiliates
                  shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising
                  from your use of the platform, even if advised of the possibility of such damages.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  11. Indemnification
                </Typography>
                <Typography variant="body1">
                  You agree to indemnify and hold harmless AquaVista from any claims, damages, liabilities, costs, and
                  expenses arising out of your use of the platform, your content, or your violation of these Terms.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  12. Termination
                </Typography>
                <Typography variant="body1">
                  You may stop using AquaVista at any time. We may suspend or terminate your account if you violate
                  these Terms, misuse the service, or if required by law. Upon termination, your right to use the
                  platform will immediately cease, and we may delete or retain your data in accordance with our data
                  retention practices and the applicable governing documents.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  13. Changes to These Terms
                </Typography>
                <Typography variant="body1">
                  We may update these Terms from time to time. We will post the updated version on this page and, where
                  appropriate, notify you by email or through the platform. Continued use after changes constitutes
                  acceptance of the revised Terms.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  14. Governing Law and Jurisdiction
                </Typography>
                <Typography variant="body1">
                  These Terms shall be governed by and construed in accordance with the laws of the United States and
                  the State of Delaware, without regard to conflict of law principles. Any disputes arising under these
                  Terms shall be subject to the exclusive jurisdiction of the courts located in Delaware.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
